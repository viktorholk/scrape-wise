import { OpenAI } from "openai";
import { ScrapedPageData } from "@/types";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { relevanceInstructions } from "./instructions";
import { analyseInstructions, createPageAnalysisPrompt, createRelevanceCheckPrompt } from "./instructions";
import { AnalyserJob, JobStatus } from "@packages/database";
import { prisma } from "@packages/database";
import { sendWsMessageToUser } from "../websocket";

const relevanceOutputSchema = z.object({
    pages: z.array(z.object({
        url: z.string(),
        reason: z.string(),
    })),
});

const fieldSchema = z.object({
    label: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
});

const analyseResultSchemaInternal = z.array(z.array(fieldSchema));

const analyseOutputSchemaForOpenAI = z.object({
    extracted_data_collection: analyseResultSchemaInternal
});

export type AnalysisResult = z.infer<typeof analyseResultSchemaInternal>;

export async function createAnalyseJob(
    userId: number,
    crawlerJobId: number,
    prompt: string,
    scheduledAnalysisJobId?: number,
    isScheduled: boolean = false
): Promise<AnalyserJob> {
    if (!prompt) {
        throw new Error("Prompt is required");
    }

    const crawlerJob = await prisma.crawlerJob.findUnique({
        where: {
            id: crawlerJobId,
        },
    });

    if (!crawlerJob) {
        throw new Error("Crawler job not found");
    }

    if (crawlerJob.status !== JobStatus.COMPLETED) {
        throw new Error("Crawler job is not completed");
    }

    const pages = crawlerJob.pages as unknown as ScrapedPageData[];

    const job = await prisma.analyserJob.create({
        data: {
            userId,
            crawlerJobId,
            prompt,
            status: JobStatus.STARTED,
            ...(scheduledAnalysisJobId && { createdByScheduledAnalysisId: scheduledAnalysisJobId })
        }
    });

    const result: AnalysisResult = await analyseResults(userId, job.id, prompt, pages, isScheduled);

    const updatedJob = await prisma.analyserJob.update({
        where: { id: job.id },
        data: {
            status: JobStatus.COMPLETED,
            results: result,
        }
    });

    return updatedJob;
}

export async function analyseResults(userId: number, jobId: number, prompt: string, results: ScrapedPageData[], isScheduled: boolean = false): Promise<AnalysisResult> {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    if (!results || results.length === 0) {
        console.log("No pages provided for analysis.");
        return [];
    }

    if (!isScheduled) {
        sendWsMessageToUser(userId, {
            type: "analyser_job_relevance_started",
            jobId
        });
    }

    console.log("Sending relevance prompt to OpenAI");
    const relevanceUserContent = createRelevanceCheckPrompt(prompt, results);
    const relevanceResponse = await client.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "developer",
                content: relevanceInstructions
            },
            {
                role: "user",
                content: relevanceUserContent
            }
        ],
        text: {
            format: zodTextFormat(relevanceOutputSchema, "output")
        }
    });

    const relevanceOutputText = relevanceResponse.output_text;

    if (!relevanceOutputText) {
        throw new Error("No relevance output received from OpenAI");
    }

    let relevantPagesFromAI: { url: string, reason: string }[];
    try {
        const parsedRelevanceOutput = JSON.parse(relevanceOutputText);
        relevantPagesFromAI = relevanceOutputSchema.parse(parsedRelevanceOutput).pages;
        console.log("Relevant pages determined by AI:", JSON.stringify(relevantPagesFromAI, null, 2));
    } catch (error) {
        console.error("Error parsing relevance output:", error);
        throw new Error("Invalid relevance output received from OpenAI");
    }

    if (!relevantPagesFromAI || relevantPagesFromAI.length === 0) {
        console.log("No relevant pages found by AI.");
        return [];
    }

    if (!isScheduled) {
        sendWsMessageToUser(userId, {
            type: "analyser_job_relevance_finished",
            jobId,
            data: relevantPagesFromAI
        });
    }

    const relevantPageURLs = new Set(relevantPagesFromAI.map(p => p.url));
    const pagesForAnalysis: ScrapedPageData[] = results.filter(p => relevantPageURLs.has(p.url));

    if (pagesForAnalysis.length === 0) {
        console.log("No matching pages found in original results for analysis, though AI found some relevant URLs. This might indicate an issue.");
        return [];
    }

    console.log(`Proceeding to main analysis with ${pagesForAnalysis.length} relevant page(s).`);

    const analysisPrompt = createPageAnalysisPrompt(prompt, pagesForAnalysis);

    if (!isScheduled) {
        sendWsMessageToUser(userId, {
            type: "analyser_job_analysis_started",
            jobId,
        });
    }

    console.log("Sending main analysis prompt to OpenAI");
    const analysisApiResponse = await client.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "developer",
                content: analyseInstructions
            },
            {
                role: "user",
                content: analysisPrompt
            }
        ],
        text: {
            format: zodTextFormat(analyseOutputSchemaForOpenAI, "output")
        }
    });

    const analysisOutputText = analysisApiResponse.output_text;

    if (!analysisOutputText) {
        throw new Error("No content received from OpenAI for main analysis");
    }

    try {
        const parsedAnalysisOutput = JSON.parse(analysisOutputText);
        const validatedOpenAIResponse = analyseOutputSchemaForOpenAI.parse(parsedAnalysisOutput);

        const actualExtractedData: AnalysisResult = validatedOpenAIResponse.extracted_data_collection;

        if (!isScheduled) {
            sendWsMessageToUser(userId, {
                type: "analyser_job_analysis_finished",
                jobId,
                data: actualExtractedData
            });
        }

        console.log("Main analysis output (after extraction):", JSON.stringify(actualExtractedData, null, 2));
        return actualExtractedData;
    } catch (error) {
        console.error("Error parsing main analysis output:", error);
        throw new Error("Invalid JSON received from OpenAI for main analysis");
    }
}