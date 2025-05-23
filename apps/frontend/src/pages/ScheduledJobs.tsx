import React, { useState, useEffect } from 'react';
import { getScheduledAnalysis, getAnalyserJobs, setScheduledAnalysis } from '../services';
import { Button } from '@/components/ui/button';
import { PlusIcon, CalendarClock, PlayCircle, PauseCircle, AlertTriangle, CheckCircle, Settings2, Eye, InfoIcon, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExtractedField } from './Analyze';
import { formatDistanceToNow, parseISO } from 'date-fns';
import cronstrue from 'cronstrue';
// Shadcn dialog and select
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type JobStatus = "STARTED" | "COMPLETED" | "STOPPED" | "ERROR";

interface AnalyserJobRun {
  id: number;
  status: JobStatus;
  results: ExtractedField[][];
  createdAt: string;
}

interface AnalyserJobForDialog {
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

interface ScheduledAnalysisJobDisplay {
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

// --- Dialog state ---
function useScheduleDialog(onScheduled: () => void) {
  const [open, setOpen] = useState(false);
  const [analyserJobs, setAnalyserJobs] = useState<AnalyserJobForDialog[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedAnalyserJobId, setSelectedAnalyserJobId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = async () => {
    setOpen(true);
    setLoadingJobs(true);
    setError(null);
    try {
      const jobs = await getAnalyserJobs();
      console.log(jobs);

      const filteredJobs = jobs.data.filter((j: any) => !j.createdByScheduledAnalysis);
      console.log(filteredJobs);
      setAnalyserJobs(filteredJobs);
    } catch (e) {
      console.error(e);
      setError("Failed to load analyser jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedAnalyserJobId(null);
    setPrompt("");
    setCronExpression("");
    setName("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedAnalyserJobId || !prompt || !cronExpression) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const selectedJob = analyserJobs.find(j => j.id === Number(selectedAnalyserJobId));
      if (!selectedJob) throw new Error("No analyser job selected");
      await setScheduledAnalysis({
        name: name || selectedJob.prompt || "Scheduled Analysis",
        cronExpression,
        prompt,
        originalCrawlerJobId: selectedJob.crawlerJobId,
      });
      closeDialog();
      onScheduled();
    } catch (e) {
      setError("Failed to create scheduled analysis");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    analyserJobs,
    loadingJobs,
    selectedAnalyserJobId,
    setSelectedAnalyserJobId,
    prompt,
    setPrompt,
    cronExpression,
    setCronExpression,
    name,
    setName,
    submitting,
    error,
    handleSubmit,
  };
}

export default function ScheduledJobs() {
  const [scheduledAnalyses, setScheduledAnalyses] = useState<ScheduledAnalysisJobDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusBadge = (status: ScheduledAnalysisJobDisplay['status']) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><PlayCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary"><PauseCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRunStatusIcon = (runStatus?: JobStatus | null) => {
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
  };
  
  const formatOptionalDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (e) {
      console.warn("Date formatting error for:", dateString, e);
      return "Invalid date";
    }
  };

  const handleFetchAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const results: ScheduledAnalysisJobFromAPI[] = await getScheduledAnalysis();
      const filteredResults = results.filter((analysis) => analysis.enabled);
      const mappedAnalyses = filteredResults
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
      setError(err instanceof Error ? err.message : "Failed to load scheduled jobs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dialog state
  const scheduleDialog = useScheduleDialog(handleFetchAnalyses);

  // Handler for dialog open state change
  const handleDialogOpenChange = (open: boolean) => {
    scheduleDialog.setOpen(open);
    if (open) scheduleDialog.openDialog();
  };

  useEffect(() => {
    handleFetchAnalyses();
  }, []);

  if (loading) {
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

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 text-red-500">
            <AlertTriangle className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Scheduled Jobs</h3>
            <p className="text-muted-foreground mb-4">Error: {error}</p>
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
        <Dialog open={scheduleDialog.open} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Schedule New Analysis
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Analysis</DialogTitle>
            </DialogHeader>
            {scheduleDialog.loadingJobs ? (
              <div>Loading analyser jobs...</div>
            ) : (
              <>
                <div className="space-y-4">
                  <Select value={scheduleDialog.selectedAnalyserJobId ?? undefined} onValueChange={scheduleDialog.setSelectedAnalyserJobId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an analyser job" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleDialog.analyserJobs.map(job => (
                        <SelectItem key={job.id} value={String(job.id)}>
                          {job.prompt} (Created: {new Date(job.createdAt).toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Name (optional)"
                    value={scheduleDialog.name}
                    onChange={e => scheduleDialog.setName(e.target.value)}
                  />
                  <Textarea
                    placeholder="Prompt"
                    value={scheduleDialog.prompt}
                    onChange={e => scheduleDialog.setPrompt(e.target.value)}
                  />
                  <Input
                    placeholder="Cron Expression"
                    value={scheduleDialog.cronExpression}
                    onChange={e => scheduleDialog.setCronExpression(e.target.value)}
                  />
                  {scheduleDialog.error && <div className="text-red-500">{scheduleDialog.error}</div>}
                </div>
                <DialogFooter>
                  <Button onClick={scheduleDialog.handleSubmit} disabled={scheduleDialog.submitting}>
                    {scheduleDialog.submitting ? "Scheduling..." : "Schedule"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {scheduledAnalyses.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
            <CalendarClock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Scheduled Jobs Yet</h3>
            <p className="text-muted-foreground mb-4">Click the button above to schedule your first analysis.</p>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {scheduledAnalyses.map((analysis) => {
          const latestRun = analysis.analyserJobRuns?.[0];
          const latestResults = latestRun?.results || [];

          return (
            <Card key={analysis.id} className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <CalendarClock className="h-5 w-5 mr-2.5 text-primary flex-shrink-0" /> 
                    <span className="truncate" title={analysis.name}>{analysis.name}</span>
                  </CardTitle>
                  {getStatusBadge(analysis.status)}
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Schedule: <span className="font-mono">{cronstrue.toString(analysis.cronExpression)}</span>
                </CardDescription>
                {analysis.initialUrl && (
                    <CardDescription className="text-xs text-muted-foreground pt-0.5 truncate" title={analysis.initialUrl}>
                        URL: {analysis.initialUrl}
                    </CardDescription>
                )}
                 {analysis.prompt && (
                    <CardDescription className="text-xs text-muted-foreground pt-0.5 truncate" title={analysis.prompt}>
                        Prompt: {analysis.prompt}
                    </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex-grow flex flex-col space-y-2.5 py-2.5">
                <div className="text-xs text-muted-foreground space-y-1.5 p-2 border rounded-md bg-background/30">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Last Run:</span> 
                        <span className="flex items-center gap-1.5">
                            {getRunStatusIcon(analysis.lastRunStatus)}
                            {formatOptionalDate(analysis.lastRunAt)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Next Run:</span>
                        <span>{formatOptionalDate(analysis.nextRunAt)}</span>
                    </div>
                </div>
                
                <div className="flex-grow relative min-h-[150px] border rounded-md p-1 bg-muted/20">
                  {latestResults.length > 0 ? (
                    <ScrollArea className="h-full absolute inset-0 p-1.5">
                      <DataTable data={latestResults} />
                    </ScrollArea>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground px-2 text-center">
                      {latestRun && (!analysis.lastRunStatus || analysis.lastRunStatus === "COMPLETED") ? 
                        "Latest run completed but extracted no data." : 
                        (latestRun ? `Latest run ${analysis.lastRunStatus?.toLowerCase() || 'had an issue'}.` : "No runs executed yet.")}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2.5 pb-3 border-t">
                <div className="flex justify-end w-full space-x-2">
                  <Button variant="outline" size="sm" className="text-xs px-2.5 py-1 h-auto"> 
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> View History
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs px-2.5 py-1 h-auto"> 
                    <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Manage
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}

      </div>
    </div>
  )
};