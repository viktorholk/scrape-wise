import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { CalendarClock, Eye, Settings2, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import type { ScheduledAnalysisJobDisplay, JobStatus } from '../pages/ScheduledJobs.tsx';
import cronstrue from 'cronstrue';
import { ScheduledJobHistory } from './ScheduledJobHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScheduledJobManageDialog } from './ScheduledJobManageDialog';
import { updateScheduledAnalysisJob, deleteScheduledAnalysisJob } from '../services';

interface ScheduledJobCardProps {
  analysis: ScheduledAnalysisJobDisplay;
  getStatusBadge: (status: ScheduledAnalysisJobDisplay['status']) => JSX.Element;
  getRunStatusIcon: (runStatus?: JobStatus | null) => JSX.Element;
  formatOptionalDate: (dateString?: string | null) => string;
  onChanged?: () => void;
}

export function ScheduledJobCard({
  analysis,
  getStatusBadge,
  getRunStatusIcon,
  formatOptionalDate,
  onChanged,
}: ScheduledJobCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const latestRun = analysis.analyserJobRuns?.[0];
  const latestResults = latestRun?.results || [];

  const handleSaveSettings = async (changes: { name: string; cronExpression: string; enabled: boolean }) => {
    await updateScheduledAnalysisJob(analysis.id, changes);
    onChanged?.();
  };
  const handleAbort = async () => {
    await deleteScheduledAnalysisJob(analysis.id);
    onChanged?.();
  };

  // Toggle enabled/disabled status
  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setToggling(true);
    try {
      await updateScheduledAnalysisJob(analysis.id, { enabled: analysis.status !== "ACTIVE" });
      onChanged?.();
    } finally {
      setToggling(false);
    }
  };

  return (
    <Card key={analysis.id} className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-1">
          <CardTitle className="text-lg font-semibold flex items-center">
            <CalendarClock className="h-5 w-5 mr-2.5 text-primary flex-shrink-0" /> 
            <span className="truncate" title={analysis.name}>{analysis.name}</span>
          </CardTitle>
          <button
            type="button"
            className="focus:outline-none"
            title={analysis.status === "ACTIVE" ? "Disable" : "Enable"}
            onClick={handleToggleStatus}
            disabled={toggling}
          >
            {toggling ? (
              <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
            ) : (
              getStatusBadge(analysis.status)
            )}
          </button>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Schedule: <span className="font-mono">
            {analysis.cronExpression && typeof analysis.cronExpression === 'string' && analysis.cronExpression.split(' ').length >= 5 
              ? cronstrue.toString(analysis.cronExpression) 
              : "Invalid cron expression"}
          </span>
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
          {/* History Dialog */}
          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs px-2.5 py-1 h-auto">
                <Eye className="h-3.5 w-3.5 mr-1.5" /> View History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Run History for {analysis.name}</DialogTitle>
              </DialogHeader>
              <ScheduledJobHistory runs={analysis.analyserJobRuns ?? []} />
            </DialogContent>
          </Dialog>
          {/* Manage Dialog */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2.5 py-1 h-auto"
            onClick={() => setManageOpen(true)}
          >
            <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Manage
          </Button>
          <ScheduledJobManageDialog
            open={manageOpen}
            onOpenChange={setManageOpen}
            analysis={analysis}
            onSave={handleSaveSettings}
            onAbort={handleAbort}
          />
        </div>
      </CardFooter>
    </Card>
  );
}