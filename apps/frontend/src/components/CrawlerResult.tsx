import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, LinkIcon, FileTextIcon, ListTree } from "lucide-react";

type CrawlerResultProps = {
  result: any;
};

export function CrawlerResult({ result }: CrawlerResultProps) {
  if (!result || !result.crawlerJob) return null;

  const { crawlerJob } = result;

  return (
    <Card className="mt-6 w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <ListTree className="h-5 w-5 mr-3 text-blue-500" />
          Crawler Log & Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <Label className="font-semibold text-base">Crawl Overview</Label>
            <div className="text-sm text-muted-foreground mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>Initial URL:</span>
                <a
                  href={crawlerJob.initialUrl}
                  className="ml-1 text-blue-600 hover:underline truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {crawlerJob.initialUrl}
                </a>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                <span>Status:</span>
                <span className="ml-1 font-mono px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                  {crawlerJob.status}
                </span>
              </div>
              <div className="flex items-center">
                <FileTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>Pages Crawled:</span>
                <span className="ml-1 font-medium">{crawlerJob.pages?.length || 0}</span>
              </div>
              {crawlerJob.crawlDepth && (
                <div className="flex items-center">
                  <ListTree className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Crawl Depth:</span>
                  <span className="ml-1 font-medium">{crawlerJob.crawlDepth}</span>
                </div>
              )}
              {crawlerJob.pageLimit && (
                <div className="flex items-center">
                  <FileTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Page Limit:</span>
                  <span className="ml-1 font-medium">{crawlerJob.pageLimit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="font-semibold text-base">Crawled Pages</Label>
          {crawlerJob.pages && crawlerJob.pages.length > 0 ? (
            <Accordion type="single" collapsible className="w-full mt-2 space-y-2">
              {crawlerJob.pages.map((page: any, idx: number) => (
                <AccordionItem value={`item-${idx}`} key={idx} className="bg-slate-50 dark:bg-slate-800/30 rounded-md border px-3">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    <div className="flex items-center truncate w-full">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                      <span className="truncate text-blue-600 hover:underline font-medium" title={page.url}>
                        {page.url}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pt-1 pb-3 space-y-1.5">
                    <div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Title:</span>{" "}
                      {page.title || <span className="italic">No title</span>}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Links Found:</span> {page.linksFound}
                    </div>
                    {page.textContent && (
                      <div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Text Snippet:</span>{" "}
                        <span className="italic">
                          "{page.textContent}"
                        </span>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-sm text-muted-foreground mt-2">No pages were crawled or data is unavailable.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}