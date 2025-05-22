import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, PencilLine, Play, Info, CheckCircle2, XCircle, FileText, Loader2, RefreshCcwIcon, RocketIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  addScrapeJob,
  getAuthToken,
  changePromtJob,
} from "@/services";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CrawlerResult } from "@/components/CrawlerResult";
import { ExtractedDataDisplay } from "@/components/ExtractedDataDisplay";

interface CrawlerJobPage {
  url: string;
  title: string;
  linksFound: number;
  textContent: string;
}

interface CrawlerJob {
  id: number;
  userId: number;
  initialUrl: string;
  crawlDepth: number;
  pageLimit: number;
  status: string;
  pages: CrawlerJobPage[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedField {
  label: string;
  value: any;
}

interface AnalyserJob {
  id: number;
  userId: number;
  crawlerJobId: number;
  prompt: string;
  status: string;
  results: ExtractedField[][];
  createdAt: string;
  updatedAt: string;
  createdByScheduledAnalysisId?: number | null;
}

interface ScrapeJobResults {
  crawlerJob: CrawlerJob;
  analyserJob: AnalyserJob;
}

interface ScrapeJob {
  url: string;
  prompt: string;
  results?: ScrapeJobResults;
  error?: string;
  inProgress?: boolean;
  crawlDepth?: number;
  pageLimit?: number;
}

interface WsMessage {
  type: 'crawler_job_started' |
  'crawler_job_progress' |
  'crawler_job_progress_error' |
  'crawler_job_finished' |
  'analyser_job_relevance_started' |
  'analyser_job_relevance_finished' |
  'analyser_job_analysis_started' |
  'analyser_job_analysis_finished' |
  'error';
  jobId: number;
  data?: any;
  timestamp?: string;
}

export default function Analyze() {
  const [url, setUrl] = useState("http://localhost:3001/ssr/recipes");
  const [prompt, setPrompt] = useState("Extract all ratings");
  const [crawlDepth, setCrawlDepth] = useState(2);
  const [pageLimit, setPageLimit] = useState(10);
  const [job, setJob] = useState<ScrapeJob | null>(null);
  const [wsMessages, setWsMessages] = useState<WsMessage[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [changingPrompt, setChangingPrompt] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setWsMessages([{ type: "error", jobId: 0, data: { error: "No authentication token found" } }]);
      return;
    }

    const isDevelopment = import.meta.env.MODE === "development";
    const wsProtocol = isDevelopment ? "ws://" : "wss://";
    const wsHost = isDevelopment
      ? "localhost:3010"
      : "scrape-wise.holk.solutions";
    const wsUrl = `${wsProtocol}${wsHost}/api`;

    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setWsMessages((prev) => [...prev, { ...messageData, timestamp: new Date().toLocaleTimeString() }]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [wsMessages]);

  const handleSubmit = async () => {
    if (!url) return;

    // Set job as in progress (no results yet)
    setJob({ url, prompt, crawlDepth, pageLimit, inProgress: true });

    try {
      const data = await addScrapeJob(url, prompt, crawlDepth, pageLimit);

      setJob({
        url,
        prompt,
        crawlDepth,
        pageLimit,
        results: data,
        inProgress: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to scrape the URL.";
      setWsMessages((prev) => [...prev, { type: "error", jobId: 0, data: { error: errorMessage }, timestamp: new Date().toLocaleTimeString() }]);
      setJob({
        url,
        prompt,
        crawlDepth,
        pageLimit,
        error: errorMessage,
        inProgress: false,
      });
    }
  };

  const getEventIcon = (type: WsMessage['type']) => {
    switch (type) {
      case 'crawler_job_started':
      case 'analyser_job_relevance_started':
      case 'analyser_job_analysis_started':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'crawler_job_progress':
        return <FileText className="h-4 w-4 text-gray-500 " />;
      case 'crawler_job_finished':
      case 'analyser_job_relevance_finished':
      case 'analyser_job_analysis_finished':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'crawler_job_progress_error':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (


    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Analyze</h2>
        <p className="text-muted-foreground">
          Analyze a website and extract data based on a prompt.
        </p>
      </div>
      <AnimatePresence initial={false} mode="wait">


{!job?.results && (
  <motion.div
    key="form-view"
    initial={{ opacity: 0, y: 40, height: 0 }}
    animate={{ opacity: 1, y: 0, height: "auto" }}
    exit={{ opacity: 0, y: -40, height: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    <div className="grid grid-cols-2 gap-4 max-w-6xl mx-auto">
      <Card className="h-[450px]">
        <CardHeader className="h-20">
          <div className="flex items-center">
            <PencilLine className="h-5 w-5 mr-2" />
            <CardTitle className="text-xl">
              Instructions
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a URL and extraction instructions, and we'll crawl the website and analyze the content.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="space-y-2">
              <Label htmlFor="url-input">Website URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={!!job?.inProgress}
              />
            </div>


            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2 mt-4">
                <Label htmlFor="crawl-depth-input" className="h-[20px]">Crawl Depth</Label>
                <Input
                  id="crawl-depth-input"
                  type="number"
                  placeholder="e.g., 2"
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(parseInt(e.target.value, 10))}
                  disabled={!!job?.inProgress}
                />
              </div>
              <div className="space-y-2 mt-4">

                <Label htmlFor="page-limit-input" className="h-[20px]">Page Limit</Label>
                <Input
                  id="page-limit-input"
                  type="number"
                  placeholder="e.g., 10"
                  value={pageLimit}
                  onChange={(e) => setPageLimit(parseInt(e.target.value, 10))}
                  disabled={!!job?.inProgress}
                />
              </div>

            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="prompt-input">Extraction Prompt</Label>
              <Textarea
                id="prompt-input"
                placeholder="e.g., Extract all product names and prices."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                disabled={!!job?.inProgress}
              />
            </div>
          </div>

          <div className="flex flex-row-reverse">

            <Button
              onClick={handleSubmit}
              disabled={!url || !prompt || job?.inProgress}
              className={`${job?.inProgress ? "cursor-wait" : "cursor-pointer"}`}
            >
              {job?.inProgress ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
              {job?.inProgress ? "Analyzing..." : "Analyze"}


            </Button>
          </div>


        </CardContent>
      </Card>

      <Card className="h-[450px]">
        <CardHeader className="h-20">
          <div className="flex items-center">
            <List className="h-5 w-5 mr-2" />
            <CardTitle className="text-xl">
              Events
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-84">

          <ScrollArea className="h-full bg-muted rounded-md p-2">
            <div className="h-full w-full">
              {wsMessages.map((msg, idx) => (
                <div key={idx} className="flex flex-row gap-2 items-start py-1.5 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(msg.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.type === 'crawler_job_started' && (
                      <span className="text-sm">Crawler job started</span>
                    )}

                    {msg.type === "crawler_job_progress" && (
                      <span className="text-sm text-slate-600 dark:text-slate-400">Crawling: {msg.data?.url}</span>
                    )}

                    {msg.type === "crawler_job_progress_error" && (
                      <span className="text-sm text-red-600 dark:text-red-400">Error crawling {msg.data?.url}: {msg.data?.error}</span>
                    )}

                    {msg.type === "crawler_job_finished" && (
                      <span className="text-sm">Crawler job finished</span>
                    )}

                    {msg.type === "analyser_job_relevance_started" && (
                      <span className="text-sm">Analyser: Determining relevant pages...</span>
                    )}

                    {msg.type === "analyser_job_relevance_finished" && (
                      <span className="text-sm">Analyser: Relevant page determination complete.</span>
                    )}

                    {msg.type === "analyser_job_analysis_started" && (
                      <span className="text-sm">Analyser: Starting data extraction...</span>
                    )}

                    {msg.type === "analyser_job_analysis_finished" && (
                      <span className="text-sm">Analyser: Data extraction complete.</span>
                    )}

                    {msg.type === "error" && (
                      <span className="text-sm text-red-600 dark:text-red-400">Error: {msg.data?.error}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </motion.div>
  )}

  {job?.results && (
    <motion.div
      key="results-view"
      initial={{ opacity: 0, y: 40, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -40, height: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        {job.results.analyserJob?.results && (
          <ExtractedDataDisplay
            extractedData={job.results.analyserJob.results}
            analyserPrompt={job.results.analyserJob.prompt}
            jobId={job.results.crawlerJob.id}
          />
        )}

        {/* Change Prompt Section */}
        {job?.results?.analyserJob?.id && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <RefreshCcwIcon className="h-5 w-5 mr-3 text-indigo-500" />
                Refine Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 flex flex-col gap-3">
                <Label htmlFor="change-prompt-input" className="font-medium">
                  Change Prompt & Re-analyse
                </Label>
                <Textarea
                  id="change-prompt-input"
                  placeholder={`Current prompt: "${job.results.analyserJob.prompt}". Enter a new prompt to re-analyse the existing crawled data.`}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  rows={3}
                  disabled={changingPrompt}
                  className="text-sm"
                />
                <Button
                  onClick={async () => {
                    if (!job.results?.analyserJob?.id || !newPrompt) return;
                    setChangingPrompt(true);
                    try {
                      const updatedResults = await changePromtJob(
                        job.results.crawlerJob.id.toString(),
                        newPrompt
                      );
                      setJob((prevJob) => {
                        if (!prevJob || !prevJob.results) return null;
                        return {
                          ...prevJob,
                          results: {
                            ...prevJob.results,
                            analyserJob: {
                              ...(prevJob.results.analyserJob as AnalyserJob),
                              ...updatedResults,
                              prompt: newPrompt, // Explicitly update prompt in state
                              status: "COMPLETED", // Assume it completes, or API should return status
                              updatedAt: new Date().toISOString(), // Reflect update time
                            },
                          },
                        };
                      });
                      setNewPrompt("");
                      setWsMessages((prev) => [
                        ...prev,
                        {
                          type: "analyser_job_analysis_finished", // Or a new type for re-analysis
                          jobId: job.results!.analyserJob!.id,
                          data: { message: "Re-analysis complete with new prompt." },
                          timestamp: new Date().toLocaleTimeString(),
                        },
                      ]);
                    } catch (err) {
                      const errorMessage =
                        err instanceof Error
                          ? err.message
                          : "Failed to change prompt.";
                      setWsMessages((prev) => [
                        ...prev,
                        {
                          type: "error",
                          jobId: job.results!.analyserJob!.id,
                          data: { error: errorMessage },
                          timestamp: new Date().toLocaleTimeString(),
                        },
                      ]);
                    } finally {
                      setChangingPrompt(false);
                    }
                  }}
                  disabled={changingPrompt || !newPrompt || newPrompt === job.results.analyserJob.prompt}
                  variant="default"
                  size="sm"
                  className="self-start"
                >
                  {changingPrompt ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCcwIcon className="h-4 w-4 mr-2" />
                  )}
                  {changingPrompt ? "Updating..." : "Re-Analyse with New Prompt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <CrawlerResult result={job.results} />

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => {
              setJob(null);
              setUrl("");
              setPrompt("");
              setCrawlDepth(2);
              setPageLimit(10);
              setWsMessages([]);
              setNewPrompt("");
            }}
            variant="default"
            size="lg"
            className="px-8 py-3 text-base font-semibold rounded-lg flex items-center"
          >
            <RocketIcon className="h-5 w-5 mr-2" />
            Start New Analysis
          </Button>
        </div>

      </div>
    </motion.div>
  )}
  
</AnimatePresence>

    </div>


    );

  }
