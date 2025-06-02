import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, FileTextIcon, ListTree } from "lucide-react";
import { DataTable } from "./DataTable";

type AnalyserResultProps = {
  analyserJob: {
    id: number;
    status: string;
    createdAt: string;
    prompt?: string;
    results?: Array<Array<{ [key: string]: any }>>;
  };
};

export function AnalyserResult({ analyserJob }: AnalyserResultProps) {
  if (!analyserJob) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <ListTree className="h-5 w-5 mr-3 text-purple-500" />
          Analysis Log & Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <Label className="font-semibold text-base">Analysis Overview</Label>
            <div className="text-sm text-muted-foreground mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <FileTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>Job ID:</span>
                <span className="ml-1 font-mono">{analyserJob.id}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                <span>Status:</span>
                <span className="ml-1 font-mono px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                  {analyserJob.status}
                </span>
              </div>
              <div className="flex items-center">
                <FileTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>Created At:</span>
                <span className="ml-1 font-medium">{new Date(analyserJob.createdAt).toLocaleString()}</span>
              </div>
              {analyserJob.prompt && (
                <div className="flex items-center col-span-2">
                  <FileTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Prompt:</span>
                  <span className="ml-1 font-mono truncate">{analyserJob.prompt}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="font-semibold text-base">Analysis Results</Label>
          {analyserJob.results && analyserJob.results.length > 0 ? (
            <DataTable
              data={analyserJob.results.map(row =>
                row.map(field => ({
                  label: field.label ?? "",
                  value: field.value ?? "",
                  ...field,
                }))
              )}
            />
          ) : (
            <div className="text-sm text-muted-foreground mt-2">No analysis results available.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}