import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setJobTemplate } from "@/services";

type ExtractedDataDisplayProps = {
  extractedData: any[];
  presentationSuggestions: any[];
  jobId?: number; // Add jobId prop for API call
};

export function ExtractedDataDisplay({ extractedData, presentationSuggestions, jobId }: ExtractedDataDisplayProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Log the jobId for debugging
  console.log("ExtractedDataDisplay jobId:", jobId);

  if (!extractedData || extractedData.length === 0) {
    return <div>No extracted data.</div>;
  }

  // Helper renderers for each template type
  const renderTable = () => {
    const headers = extractedData[0]?.fields.map((f: any) => f.label);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              {headers.map((label: string, idx: number) => (
                <th key={idx} className="border px-2 py-1 text-left bg-gray-100 dark:bg-gray-800">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {extractedData.map((item: any, idx: number) => (
              <tr key={idx}>
                {item.fields.map((field: any, fidx: number) => (
                  <td key={fidx} className="border px-2 py-1">{field.value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBarChart = () => {
    const max = Math.max(...extractedData.map((item: any) => item.fields[0].value));
    return (
      <div className="space-y-1">
        {extractedData.map((item: any, idx: number) => {
          const value = item.fields[0].value;
          return (
            <div key={idx} className="flex items-center">
              <Label className="w-12 text-xs mr-2">#{idx + 1}</Label>
              <div className="bg-blue-500 h-4 rounded" style={{ width: `${(value / max) * 200}px` }} />
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
            <span key={fidx}>{field.label}: <span className="font-mono">{field.value}</span></span>
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
    if (!jobId) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await setJobTemplate(jobId, suggestion.template_type);
      setSaveMsg("Template saved!");
    } catch (e: any) {
      setSaveMsg(e.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2 flex-wrap">
        {presentationSuggestions?.map((s: any, idx: number) => (
          <Button
            key={idx}
            size="sm"
            variant={selectedIdx === idx ? "default" : "outline"}
            onClick={() => setSelectedIdx(idx)}
            className="text-xs"
          >
            {s.template_type.replace("_", " ")}
          </Button>
        ))}
      </div>
      <Card className="mt-2">
        <CardHeader>
          <CardTitle>
            {`Extracted Data (${title})`}
            <div className="text-xs font-normal mt-1 text-gray-500">{suggestion?.description}</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content}
          <div className="text-xs text-gray-400 mt-2">{suggestion?.suitability_reason}</div>
          {jobId && (
            <div className="mt-4">
              <Button onClick={handleSaveTemplate} disabled={saving}>
                {saving ? "Saving..." : "Set as preferred template"}
              </Button>
              {saveMsg && <div className="text-xs mt-2">{saveMsg}</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}