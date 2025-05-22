import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setJobTemplate } from "@/services";
import { BarChart3, TableIcon, ListChecks, Info, Check } from "lucide-react";

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
  const [selectedIdx, setSelectedIdx] = useState(0);
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

  const getTemplateIcon = (templateType: string) => {
    if (templateType === "TABLE") return <TableIcon className="h-4 w-4 mr-2" />;
    if (templateType === "BAR_CHART") return <BarChart3 className="h-4 w-4 mr-2" />;
    if (templateType === "LIST_VIEW") return <ListChecks className="h-4 w-4 mr-2" />;
    return <Info className="h-4 w-4 mr-2" />;
  };

  // Helper renderers for each template type
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

  const renderBarChart = () => {
    const max = Math.max(
      ...extractedData.map((item: any) => item.fields[0].value)
    );
    return (
      <div className="space-y-1">
        {extractedData.map((item: any, idx: number) => {
          const value = item.fields[0].value;
          return (
            <div key={idx} className="flex items-center">
              <Label className="w-12 text-xs mr-2">#{idx + 1}</Label>
              <div
                className="bg-blue-500 h-4 rounded"
                style={{ width: `${(value / max) * 200}px` }}
              />
              <span className="ml-2 font-mono text-xs">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => (
    <ul className="list-disc ml-6 text-xs">
      {extractedData.map((item: any, idx: number) => (
        <li key={idx}>
          {item.fields.map((field: any, fidx: number) => (
            <span key={fidx}>
              {field.label}: <span className="font-mono">{field.value}</span>
            </span>
          ))}
        </li>
      ))}
    </ul>
  );

  // Render the selected template
  const suggestion = presentationSuggestions?.[selectedIdx];
  let content = null;
  let title = "";
  if (suggestion?.template_type === "TABLE") {
    content = renderTable();
    title = "Table";
  } else if (suggestion?.template_type === "BAR_CHART") {
    content = renderBarChart();
    title = "Bar Chart";
  } else {
    content = renderListView();
    title = "List View";
  }

  // Handle save template
  const handleSaveTemplate = async () => {
    if (!jobId || !presentationSuggestions?.[selectedIdx]) return;
    const suggestion = presentationSuggestions[selectedIdx];
    setSaving(true);
    setSaveMsg(null);
    setShowSaveConfirmation(false);
    try {
      await setJobTemplate({
        name: suggestion.template_type,
        content: JSON.stringify(extractedData),
        type: suggestion.template_type,
        dynamic: false,
        analyserJobId: jobId,
      });
      setSaveMsg("Preferred presentation template saved!");
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000); // Hide after 3 seconds
    } catch (e: any) {
      setSaveMsg(e.message || "Failed to save template");
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
            <div className="flex gap-2 flex-wrap">
              {presentationSuggestions?.map((s: any, idx: number) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={selectedIdx === idx ? "default" : "outline"}
                  onClick={() => setSelectedIdx(idx)}
                  className="text-xs px-3 py-1.5 h-auto flex items-center whitespace-nowrap"
                >
                  {getTemplateIcon(s.template_type)}
                  {s.template_type.replace("_", " ")}
                </Button>
              ))}
            </div>
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
                onClick={handleSaveTemplate}
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
                  : "Set as Preferred Template"}
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
