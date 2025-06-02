import React, { useState, useEffect, useCallback } from 'react';
import { getScheduledAnalysis, getAnalyserJobs, setScheduledAnalysis } from '../services';
import { Button } from '@/components/ui/button';
import { PlusIcon, CalendarClock, PlayCircle, PauseCircle, AlertTriangle, CheckCircle, Settings2, Eye, InfoIcon, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import type { ExtractedField } from './Analyze';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScheduledJobCard } from '../components/ScheduledJobCard';
import { ScheduleAnalysisForm } from '../components/ScheduleAnalysisForm';

export type JobStatus = "STARTED" | "COMPLETED" | "STOPPED" | "ERROR";

export interface AnalyserJobRun {
  id: number;
  status: JobStatus;
  results: ExtractedField[][];
  createdAt: string;
}

export interface AnalyserJobForDialog {
  id: number;
  prompt: string;
  createdAt: string;
  crawlerJobId: number;
  createdByScheduledAnalysis: any;
}

interface ScheduledAnalysisJobFromAPI {
  id: number;
  name: string;
  enabled: boolean;
  originalCrawlerJobId: number;
  prompt: string;
  cronExpression: string;
  lastRun?: string | null;
  nextRun?: string | null;
  lastRunStatus?: JobStatus | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  analyserJobRuns?: AnalyserJobRun[];
  originalCrawlerJob?: {
    initialUrl: string;
  };
}

export interface ScheduledAnalysisJobDisplay {
  id: number;
  name: string;
  cronExpression: string;
  status: "ACTIVE" | "INACTIVE";
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  lastRunStatus?: JobStatus | null;
  analyserJobRuns?: AnalyserJobRun[];
  initialUrl?: string;
  prompt?: string;
}

export default function ScheduledJobs() {
  const [scheduledAnalyses, setScheduledAnalyses] = useState<ScheduledAnalysisJobDisplay[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [fetchPageError, setFetchPageError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [analyserJobs, setAnalyserJobs] = useState<AnalyserJobForDialog[]>([]);
  const [loadingAnalyserJobs, setLoadingAnalyserJobs] = useState(false);
  const [selectedAnalyserJobId, setSelectedAnalyserJobId] = useState<string | null>(null);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleCronExpression, setNewScheduleCronExpression] = useState("*/5 * * * *");
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const getStatusBadge = useCallback((status: ScheduledAnalysisJobDisplay['status']) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><PlayCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary"><PauseCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }, []);

  const getRunStatusIcon = useCallback((runStatus?: JobStatus | null) => {
    if (!runStatus) return <span title="No run status"><InfoIcon className="h-4 w-4 text-gray-400" /></span>;
    switch (runStatus) {
      case "STARTED":
        return <span title="Started"><Loader2 className="h-4 w-4 text-blue-500 animate-spin" /></span>;
      case "COMPLETED":
        return <span title="Completed"><CheckCircle className="h-4 w-4 text-green-500" /></span>;
      case "STOPPED":
        return <span title="Stopped"><PauseCircle className="h-4 w-4 text-yellow-500" /></span>;
      case "ERROR":
        return <span title="Error"><AlertTriangle className="h-4 w-4 text-red-500" /></span>;
      default:
        return <span title={`Status: ${runStatus}`}><InfoIcon className="h-4 w-4 text-gray-500" /></span>;
    }
  }, []);
  
  const formatOptionalDate = useCallback((dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true, includeSeconds: true });
    } catch (e) {
      console.warn("Date formatting error for:", dateString, e);
      return "Invalid date";
    }
  }, []);

  const handleFetchAnalyses = useCallback(async () => {
    setLoadingPage(true);
    setFetchPageError(null);
    try {
      const results: ScheduledAnalysisJobFromAPI[] = await getScheduledAnalysis();
      const mappedAnalyses = results
        .map((analysis): ScheduledAnalysisJobDisplay => ({
          id: analysis.id,
          name: analysis.name,
          cronExpression: analysis.cronExpression,
          status: analysis.enabled ? "ACTIVE" : "INACTIVE",
          lastRunAt: analysis.lastRun,
          nextRunAt: analysis.nextRun,
          lastRunStatus: analysis.lastRunStatus,
          analyserJobRuns: analysis.analyserJobRuns?.map(run => ({
            ...run,
            results: run.results || [],
          })) || [],
          initialUrl: analysis.originalCrawlerJob?.initialUrl,
          prompt: analysis.prompt,
        }));
      setScheduledAnalyses(mappedAnalyses);
    } catch (err) {
      console.error("Failed to load scheduled jobs:", err);
      setFetchPageError(err instanceof Error ? err.message : "Failed to load scheduled jobs. Please try again.");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  const fetchAnalyserJobsForDialog = useCallback(async () => {
    setLoadingAnalyserJobs(true);
    setDialogError(null);
    try {
      const resutlt = await getAnalyserJobs();
      setAnalyserJobs(resutlt.data);
    } catch (e) {
      console.error("Failed to load analyser jobs for dialog:", e);
      setDialogError("Failed to load analyser jobs. Please try again.");
      setAnalyserJobs([]);
    } finally {
      setLoadingAnalyserJobs(false);
    }
  }, []);

  const handleDialogSetOpen = (open: boolean) => {
    if (open) {
      fetchAnalyserJobsForDialog();
      setSelectedAnalyserJobId(null);
      setNewScheduleName("");
      setNewScheduleCronExpression("*/5 * * * *");
      setDialogError(null);
    }
    setDialogOpen(open);
  };

  const handleSubmitNewSchedule = async () => {
    if (!selectedAnalyserJobId || !newScheduleCronExpression) {
      setDialogError("Analyser job and cron expression are required");
      return;
    }
    setSubmittingSchedule(true);
    setDialogError(null);
    try {
      const selectedJob = analyserJobs.find(j => j.id === Number(selectedAnalyserJobId));
      if (!selectedJob) {
        setDialogError("Selected analyser job not found. Please refresh and try again.");
        setSubmittingSchedule(false);
        return;
      }
      await setScheduledAnalysis({
        name: newScheduleName || selectedJob.prompt || "Scheduled Analysis",
        cronExpression: newScheduleCronExpression,
        prompt: selectedJob.prompt,
        originalAnalysisJobId: selectedJob.id,
      });
      setDialogOpen(false);
      handleFetchAnalyses();
    } catch (e) {
      console.error("Failed to create scheduled analysis:", e);
      setDialogError(e instanceof Error ? e.message : "Failed to create scheduled analysis. Please try again.");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  useEffect(() => {
    handleFetchAnalyses();
  }, [handleFetchAnalyses]);

  if (loadingPage) {
    return (
        <div className="p-4 md:p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Scheduled Jobs</h2>
                    <p className="text-muted-foreground">View and manage your automated analysis tasks.</p>
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col h-full shadow-md min-h-[380px]">
                        <CardHeader className="pb-4">
                            <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mt-2 animate-pulse"></div>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col space-y-3 py-2">
                            <div className="space-y-1">
                                <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                                <div className="h-4 bg-muted rounded w-4/6 animate-pulse"></div>
                            </div>
                            <div className="flex-grow relative min-h-[150px] border rounded-md bg-muted/20 animate-pulse"></div>
                        </CardContent>
                        <CardFooter className="pt-3 pb-4 border-t">
                            <div className="flex justify-end w-full space-x-2">
                                <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
                                <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  if (fetchPageError) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 text-red-500">
            <AlertTriangle className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Scheduled Jobs</h3>
            <p className="text-muted-foreground mb-4">Error: {fetchPageError}</p>
            <Button onClick={handleFetchAnalyses}> 
                Try Again
            </Button>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scheduled Jobs</h2>
          <p className="text-muted-foreground">
            View and manage your automated analysis tasks.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogSetOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Schedule New Analysis
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Schedule New Analysis</DialogTitle>
            </DialogHeader>
            <ScheduleAnalysisForm 
              analyserJobs={analyserJobs}
              selectedAnalyserJobId={selectedAnalyserJobId}
              setSelectedAnalyserJobId={setSelectedAnalyserJobId}
              name={newScheduleName}
              setName={setNewScheduleName}
              cronExpression={newScheduleCronExpression}
              setCronExpression={setNewScheduleCronExpression}
              handleSubmit={handleSubmitNewSchedule}
              submitting={submittingSchedule}
              error={dialogError}
              loadingJobs={loadingAnalyserJobs}
            />
          </DialogContent>
        </Dialog>
      </div>

      {scheduledAnalyses.length === 0 && !loadingPage && (
        <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
            <CalendarClock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Scheduled Jobs Yet</h3>
            <p className="text-muted-foreground mb-4">Click the button above to schedule your first analysis.</p>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {scheduledAnalyses.map((analysis) => (
          <ScheduledJobCard 
            key={analysis.id}
            analysis={analysis} 
            getStatusBadge={getStatusBadge} 
            getRunStatusIcon={getRunStatusIcon} 
            formatOptionalDate={formatOptionalDate} 
            onChanged={handleFetchAnalyses} // <-- add this line
          />
        ))}
      </div>
    </div>
  )
};