import * as cron from 'node-cron';
import { CronExpressionParser } from 'cron-parser';
import { prisma, ScheduledAnalysisJob, JobStatus, CrawlerJob, AnalyserJob } from '@packages/database';
import { createCrawlJob } from './crawler';
import { createAnalyseJob } from './analyser';

const activeCronJobs = new Map<number, cron.ScheduledTask>();

function calculateNextRunTime(cronExpression: string): Date | null {
    try {
        const interval = CronExpressionParser.parse(cronExpression);
        return interval.next().toDate();
    } catch (err) {
        console.error(`Invalid cron expression: ${cronExpression}`, err);
        return null;
    }
}

export async function initializeSchedulers(): Promise<void> {
    const enabledJobs = await prisma.scheduledAnalysisJob.findMany({
        where: { enabled: true },
    });

    for (const job of enabledJobs) {
        console.log(`Initializing job: ${job.id} (${job.name})`);
        scheduleJob(job);
    }
}

export function unscheduleJob(scheduledJobId: number): void {
    const existingTask = activeCronJobs.get(scheduledJobId);
    if (existingTask) {
        existingTask.stop();
        activeCronJobs.delete(scheduledJobId);
        console.log(`Unscheduled job ${scheduledJobId}`);
    }
}

async function executeScheduledJobRun(scheduledJobId: number): Promise<void> {
    console.log(`Executing ScheduledAnalysisJob ID: ${scheduledJobId} at ${new Date().toISOString()}`);

    let overallRunStatus: JobStatus = JobStatus.STARTED;
    let runErrorMessage: string | null = null;
    let newCrawlerJob: CrawlerJob | null = null;
    let newAnalyserJob: AnalyserJob | null = null;

    const scheduledJob = await prisma.scheduledAnalysisJob.findUnique({
        where: { id: scheduledJobId },
        include: { originalCrawlerJob: true },
    });

    if (!scheduledJob) {
        unscheduleJob(scheduledJobId);
        return;
    }

    if (!scheduledJob.enabled) {
        unscheduleJob(scheduledJobId);
        return;
    }

    await prisma.scheduledAnalysisJob.update({
        where: { id: scheduledJobId },
        data: {
            lastRun: new Date(),
            lastRunStatus: JobStatus.STARTED,
        },
    });

    try {
        console.log(`Invoking createCrawlJob for ScheduledAnalysisJob ID: ${scheduledJob.id}`);
        newCrawlerJob = await createCrawlJob(
            scheduledJob.userId,
            scheduledJob.originalCrawlerJob.initialUrl,
            {
                depth: scheduledJob.originalCrawlerJob.crawlDepth,
                limit: scheduledJob.originalCrawlerJob.pageLimit
            },
            true
        );

        if (!newCrawlerJob) {
            throw new Error("createCrawlJob failed to return a job object.");
        }

        console.log(`Crawl job (ID: ${newCrawlerJob.id}) for scheduled run (ID: ${scheduledJob.id}) finished with status: ${newCrawlerJob.status}`);

        if (newCrawlerJob.status !== JobStatus.COMPLETED) {
            throw new Error(`Crawl did not complete successfully. Final status: ${newCrawlerJob.status}.`);
        }

        console.log(`Creating new AnalyserJob for CrawlerJob ID: ${newCrawlerJob.id} (Scheduled: ${scheduledJob.id})`);
        newAnalyserJob = await createAnalyseJob(
            scheduledJob.userId,
            newCrawlerJob.id,
            scheduledJob.prompt,
            scheduledJob.id,
            true
        );

        if (!newAnalyserJob) {
            throw new Error("createAnalyseJob failed to return a job object.");
        }

        if (newAnalyserJob.status !== JobStatus.COMPLETED) {
            throw new Error(`Analysis did not complete successfully. Status: ${newAnalyserJob.status}`);
        }

        overallRunStatus = JobStatus.COMPLETED;
        console.log(`Scheduled run for ID: ${scheduledJob.id} completed successfully.`);

    } catch (error: any) {
        console.error(`Error during execution of ScheduledAnalysisJob ID: ${scheduledJob.id}: ${error.message}`, error);
        overallRunStatus = JobStatus.ERROR;
        runErrorMessage = error.message?.substring(0, 1000) || "Unknown error during scheduled run execution.";

        const errorData: any = {
            scheduledAnalysisJobId: scheduledJob.id,
            name: scheduledJob.name,
            error: runErrorMessage
        };
        if (newCrawlerJob?.id) errorData.newCrawlerJobId = newCrawlerJob.id;
        if (newAnalyserJob?.id) errorData.newAnalyserJobId = newAnalyserJob.id;
    } finally {
        const nextRunTime = calculateNextRunTime(scheduledJob.cronExpression);
        await prisma.scheduledAnalysisJob.update({
            where: { id: scheduledJob.id },
            data: {
                nextRun: nextRunTime,
                lastRunStatus: overallRunStatus,
            },
        });

    }
}

export function scheduleJob(scheduledJob: ScheduledAnalysisJob): void {
    if (!scheduledJob.enabled) {
        console.log(`Job ${scheduledJob.id} (${scheduledJob.name}) is disabled, not scheduling.`);
        unscheduleJob(scheduledJob.id);
        return;
    }

    if (!cron.validate(scheduledJob.cronExpression)) {
        console.error(`Invalid cron expression for job ${scheduledJob.id} (${scheduledJob.name}): ${scheduledJob.cronExpression}. Not scheduling.`);
        prisma.scheduledAnalysisJob.update({
            where: { id: scheduledJob.id },
            data: { enabled: false, lastRunStatus: JobStatus.ERROR, lastRun: new Date() }
        }).catch(e => console.error("Failed to update job due to invalid cron:", e));
        return;
    }

    if (activeCronJobs.has(scheduledJob.id)) {
        console.log(`Job ${scheduledJob.id} (${scheduledJob.name}) already scheduled. Stopping existing before rescheduling.`);
        activeCronJobs.get(scheduledJob.id)?.stop();
        activeCronJobs.delete(scheduledJob.id);
    }

    const task = cron.schedule(scheduledJob.cronExpression, () => {
        console.log(`Cron triggered for ScheduledAnalysisJob ID: ${scheduledJob.id} (${scheduledJob.name}) at ${new Date().toISOString()}`);
        executeScheduledJobRun(scheduledJob.id).catch(err => {
            console.error(`Error directly from executeScheduledJobRun for ${scheduledJob.id}:`, err);
        });
    });

    activeCronJobs.set(scheduledJob.id, task);
    console.log(`Scheduled job ${scheduledJob.id} (${scheduledJob.name}) with cron: ${scheduledJob.cronExpression}`);

    const nextRunTimeOnSchedule = calculateNextRunTime(scheduledJob.cronExpression);
    if (nextRunTimeOnSchedule) {
        prisma.scheduledAnalysisJob.update({
            where: { id: scheduledJob.id },
            data: { nextRun: nextRunTimeOnSchedule }
        }).catch(e => console.error("Failed to update nextRun for newly scheduled job:", scheduledJob.id, e));
    }
}

export async function updateScheduledJob(scheduledJobId: number): Promise<void> {
    unscheduleJob(scheduledJobId);// Always unschedule first
    try {
        const scheduledJob = await prisma.scheduledAnalysisJob.findUnique({ 
            where: { id: scheduledJobId } 
        });
        if (scheduledJob) {
            if (scheduledJob.enabled) {
                console.log(` Job ${scheduledJobId} (${scheduledJob.name}) is enabled, rescheduling with latest settings.`);
                scheduleJob(scheduledJob);
            } 
        }
    } catch (error) {
        console.error(`Error fetching job ${scheduledJobId} during update attempt:`, error);
    }
}