import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type CrawlerResultProps = {
  result: any;
};

export function CrawlerResult({ result }: CrawlerResultProps) {
  if (!result) return null;

  const { crawlerJob, analyserJob } = result;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-2xl mb-2">Crawler & Analysis Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label className="font-semibold text-lg">Crawler Job</Label>
          <div className="text-sm mt-2 space-y-2">
            <div>Status: <span className="font-mono">{crawlerJob.status}</span></div>
            <div>
              Initial URL:{" "}
              <a href={crawlerJob.initialUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                {crawlerJob.initialUrl}
              </a>
            </div>
          </div>
          <Separator className="my-4" />
          <Label className="font-semibold text-base">Pages Crawled</Label>
          <div className="space-y-4 mt-2">
            {crawlerJob.pages.map((page: any, idx: number) => (
              <Card key={idx} className="p-3 bg-gray-50 dark:bg-gray-900">
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <div>
                    <span className="font-semibold">Title:</span>{" "}
                    {page.title || <span className="italic text-gray-400">No title</span>}
                  </div>
                  <div>
                    <span className="font-semibold">URL:</span>{" "}
                    <a href={page.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                      {page.url}
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold">Links found:</span> {page.linksFound}
                  </div>
                  <div>
                    <span className="font-semibold">Text snippet:</span>{" "}
                    <span>
                      {page.textContent?.slice(0, 120)}
                      {page.textContent && page.textContent.length > 120 ? "..." : ""}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <Label className="font-semibold text-lg">Analyser Job</Label>
          <div className="text-sm mt-2 space-y-2">
            <div>Status: <span className="font-mono">{analyserJob.status}</span></div>
            <div>Prompt: <span className="italic">{analyserJob.prompt}</span></div>
          </div>
          <Separator className="my-4" />
          <Label className="font-semibold text-base">Extracted Ratings</Label>
          <ul className="list-decimal ml-6 mt-2 text-xs space-y-2">
            {analyserJob.results?.extracted_data?.map((item: any, idx: number) => (
              <li key={idx}>
                {item.fields.map((field: any, fidx: number) => (
                  <span key={fidx}>{field.label}: <span className="font-mono">{field.value}</span></span>
                ))}
              </li>
            ))}
          </ul>
          {analyserJob.results?.presentation_suggestions && (
            <>
              <Separator className="my-4" />
              <Label className="font-semibold text-base">Presentation Suggestions</Label>
              <ul className="list-disc ml-6 mt-2 text-xs space-y-2">
                {analyserJob.results.presentation_suggestions.map((s: any, idx: number) => (
                  <li key={idx} className="mb-2">
                    <div className="font-semibold">{s.template_type}</div>
                    <div>{s.description}</div>
                    <div className="text-gray-500">{s.suitability_reason}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}