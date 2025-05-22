import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { ExtractedField } from "../pages/Analyze";

type ExtractedDataDisplayProps = {
  extractedData: ExtractedField[][];
  analyserPrompt?: string;
};

export function ExtractedDataDisplay({
  extractedData,
  analyserPrompt,
}: ExtractedDataDisplayProps) {
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

  const renderTable = () => {
    if (!extractedData[0] || extractedData[0].length === 0) {
      return <p className="text-muted-foreground">Extracted data is in an unexpected format.</p>;
    }
    const headers = extractedData[0].map((field: ExtractedField) => field.label);
    
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
            {extractedData.map((item: ExtractedField[], idx: number) => (
              <tr key={idx}>
                {item.map((field: ExtractedField, fidx: number) => (
                  <td key={fidx} className="border px-2 py-1">
                    {String(field.value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
            {renderTable()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
