import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setScheduledAnalysis } from "@/services";
import { Info, Check } from "lucide-react";

type ExtractedDataDisplayProps = {
  extractedData: any[];
  presentationSuggestions: any[];
  jobId?: number;
  analyserPrompt?: string;
};

export function ExtractedDataDisplay({
  extractedData,
  presentationSuggestions,
  jobId,
  analyserPrompt,
}: ExtractedDataDisplayProps) {
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Log the jobId for debugging
  console.log("ExtractedDataDisplay jobId:", jobId);

  if (!extractedData || extractedData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Info className="h-5 w-5 mr-3 text-orange-500" />
            Extracted Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data was extracted based on the provided prompt.</p>
          {analyserPrompt && <p className="text-sm mt-2">Prompt: <i className="text-muted-foreground">{analyserPrompt}</i></p>}
        </CardContent>
      </Card>
    );
  }

  // Helper renderer for table
  const renderTable = () => {
    const headers = extractedData[0]?.fields.map((f: any) => f.label);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              {headers.map((label: string, idx: number) => (
                <th
                  key={idx}
                  className="border px-2 py-1 text-left bg-gray-100 dark:bg-gray-800"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {extractedData.map((item: any, idx: number) => (
              <tr key={idx}>
                {item.fields.map((field: any, fidx: number) => (
                  <td key={fidx} className="border px-2 py-1">
                    {field.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Always use the first suggestion (assumed to be TABLE)
  const suggestion = presentationSuggestions?.[0];
  let content = renderTable();

  // Handle save scheduled analysis (was: save template)
  const handleSaveScheduledAnalysis = async () => {
    if (!jobId || !suggestion) return;
    setSaving(true);
    setSaveMsg(null);
    setShowSaveConfirmation(false);
    try {
      await setScheduledAnalysis({
        name: suggestion.template_type,
        cronExpression: "* * * * *", // You may want to adjust this
        analyserJobId: jobId,
        crawlerJobId: jobId, // You may want to adjust this
      });
      setSaveMsg("Preferred scheduled analysis saved!");
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000); // Hide after 3 seconds
    } catch (e: any) {
      setSaveMsg(e.message || "Failed to save scheduled analysis");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="flex items-center text-xl mb-2 sm:mb-0">
              <Info className="h-5 w-5 mr-3 text-blue-500" />
              Analysis Results
            </CardTitle>
          </div>
           {analyserPrompt && (
            <p className="text-sm mt-3 text-muted-foreground">
              Prompt: <i className="text-slate-600 dark:text-slate-400">{analyserPrompt}</i>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">
            {suggestion?.description}
          </div>
          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/30 min-h-[200px]">
            {content}
          </div>
          <div className="text-xs text-muted-foreground italic mt-1">
            {suggestion?.suitability_reason}
          </div>

          {jobId && suggestion && (
            <div className="mt-6 flex flex-col items-center">
              <Button
                onClick={handleSaveScheduledAnalysis}
                disabled={saving || showSaveConfirmation}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                {saving ? (
                  <Info className="h-4 w-4 mr-2 animate-spin" />
                ) : showSaveConfirmation ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {saving
                  ? "Saving..."
                  : showSaveConfirmation
                  ? "Preference Saved"
                  : "Set as Preferred Scheduled Analysis"}
              </Button>
              {saveMsg && !showSaveConfirmation && (
                <div className={`text-xs mt-2 text-center ${saveMsg.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                  {saveMsg}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
