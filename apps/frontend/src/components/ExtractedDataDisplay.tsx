import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, Info } from "lucide-react";
import type { ExtractedField } from "../pages/Analyze";
import { useState } from "react";
import { setScheduledAnalysis } from "@/services";
import { Button } from "./ui/button";
import { DataTable } from "./DataTable";

type ExtractedDataDisplayProps = {
  extractedData: ExtractedField[][];
  jobId?: number;
  analyserPrompt?: string;
};

export function ExtractedDataDisplay({
  extractedData,
  analyserPrompt,
  jobId,
}: ExtractedDataDisplayProps) {
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [cronInterval, setCronInterval] = useState("*/5 * * * *");
  const [enabled, setEnabled] = useState(true);

  if (!extractedData || extractedData.length === 0 || extractedData.every(item => item.length === 0)) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Info className="h-5 w-5 mr-3 text-orange-500" />
            Extracted Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data was extracted based on the provided prompt, or the extracted data is empty.</p>
          {analyserPrompt && <p className="text-sm mt-2">Prompt: <i className="text-muted-foreground">{analyserPrompt}</i></p>}
        </CardContent>
      </Card>
    );
  }

  const handleSaveScheduledAnalysis = async () => {
    if (!jobId ) return;
    setSaving(true);
    setSaveMsg(null);
    setShowSaveConfirmation(false);
    try {
      await setScheduledAnalysis({
        name: "Extract Data",
        cronExpression: cronInterval,
        prompt: analyserPrompt || "",
        originalAnalysisJobId: jobId,
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
          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/30 min-h-[200px]">
            <DataTable data={extractedData} />
          </div>

          {jobId  && (
            <div className="mt-6 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-2">
                {/* Cron Interval Select with label and icon */}
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500"/>
                  <label htmlFor="cron-interval" className="text-xs font-medium text-muted-foreground">
                    Run every:
                  </label>
                  <select
                    id="cron-interval"
                    className="border rounded px-2 py-1 text-sm bg-background"
                    value={cronInterval}
                    onChange={e => setCronInterval(e.target.value)}
                    disabled={saving || showSaveConfirmation}
                  >
                    <option value="*/5 * * * *">5 min</option>
                    <option value="*/10 * * * *">10 min</option>
                    <option value="0 * * * *">1 hour</option>
                    <option value="0 0 * * *">1 day</option>
                  </select>
                </div>
                {/* Enabled Toggle with label and icon */}
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${enabled ? "text-green-500" : "text-gray-400"}`} />
                  <label htmlFor="enable-toggle" className="text-xs font-medium text-muted-foreground">
                    Scheduled:
                  </label>
                  <Button
                    id="enable-toggle"
                    type="button"
                    variant={enabled ? "default" : "outline"}
                    size="sm"
                    className="px-3"
                    onClick={() => setEnabled(e => !e)}
                    disabled={saving || showSaveConfirmation}
                    aria-pressed={enabled}
                  >
                    {enabled ? "On" : "Off"}
                  </Button>
                </div>
              </div>
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
                  : "Save as Scheduled Analysis"}
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
