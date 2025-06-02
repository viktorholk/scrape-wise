import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, parseISO } from "date-fns";
import { CheckCircle, AlertTriangle, PauseCircle, Loader2 } from "lucide-react";

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "ERROR":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "STOPPED":
      return <PauseCircle className="h-4 w-4 text-yellow-500" />;
    case "STARTED":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    default:
      return null;
  }
}

type AnalyserJobRun = {
  id: number;
  status: string;
  results: any[][];
  createdAt: string;
};

type ScheduledJobHistoryProps = {
  runs: AnalyserJobRun[];
};

export const ScheduledJobHistory: React.FC<ScheduledJobHistoryProps> = ({ runs }) => {
  if (!runs || runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No runs yet.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {runs
            .slice()
            .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime())
            .map(run => (
              <div key={run.id} className="flex items-center gap-3 border-b last:border-b-0 py-2">
                {getStatusIcon(run.status)}
                <span className="text-xs font-medium">{run.status}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(run.createdAt), { addSuffix: true })}
                </span>
                <Badge variant="outline" className="ml-auto">{run.results?.length ?? 0} result(s)</Badge>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};