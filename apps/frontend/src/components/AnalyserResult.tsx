import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, FileTextIcon, ListTree } from "lucide-react";

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
            <Accordion type="single" collapsible className="w-full mt-2 space-y-2">
              {analyserJob.results.map((result, idx) => (
                <AccordionItem value={`item-${idx}`} key={idx} className="bg-slate-50 dark:bg-slate-800/30 rounded-md border px-3">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    <div className="flex items-center truncate w-full">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                      <span className="truncate font-medium">Result {idx + 1}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pt-1 pb-3 space-y-1.5">
                    <pre className="bg-slate-100 dark:bg-slate-900 rounded p-2 overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-sm text-muted-foreground mt-2">No analysis results available.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}