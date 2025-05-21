import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  addScrapeJob,
  getAuthToken,
  stopJob,
  changePromtJob,
} from "@/services";
import { CrawlerResult } from "@/components/CrawlerResult";
import { ExtractedDataDisplay } from "@/components/ExtractedDataDisplay";
import { motion, AnimatePresence } from "framer-motion";

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

interface ExtractedField {
  label: string;
  value: any;
}

interface ExtractedDataItem {
  fields: ExtractedField[];
}

interface PresentationSuggestion {
  description: string;
  template_type: "LIST_VIEW" | "BAR_CHART" | "TABLE";
  suitability_reason: string;
}

interface AnalyserJobResults {
  extracted_data: ExtractedDataItem[];
  presentation_suggestions: PresentationSuggestion[];
}

interface AnalyserJob {
  id: number;
  userId: number;
  crawlerJobId: number;
  prompt: string;
  status: string;
  results: AnalyserJobResults;
  createdAt: string;
  updatedAt: string;
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
  inProgress?: boolean; // <-- Add this
}

export default function Analysere() {
  const [url, setUrl] = useState("http://localhost:3001/ssr/recipes?page=16");
  const [prompt, setPrompt] = useState("Extract all ratings");
  const [job, setJob] = useState<ScrapeJob | null>(null);
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [changingPrompt, setChangingPrompt] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Always connect WebSocket on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setWsMessages(["No authentication token found"]);
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
      setWsMessages((prev) => [...prev, event.data]);
    };

    ws.onerror = () => {
      setWsMessages((prev) => [...prev, "WebSocket error"]);
    };

    ws.onclose = () => {
      setWsMessages((prev) => [...prev, "WebSocket closed"]);
    };
  }, []);

  const handleSubmit = async () => {
    if (!url) return;

    // Set job as in progress (no results yet)
    setJob({ url, prompt, inProgress: true });

    try {
      const data = await addScrapeJob(url, prompt);

      setJob({
        url,
        prompt,
        results: data,
        inProgress: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to scrape the URL.";
      setWsMessages((prev) => [...prev, errorMessage]);
      setJob({
        url,
        prompt,
        error: errorMessage,
        inProgress: false,
      });
    }
  };

  const handleStopJob = async () => {
    if (job?.results?.crawlerJob?.id) {
      try {
        await stopJob(job.results.crawlerJob.id);
        setWsMessages((prev) => [...prev, "Job stopped successfully."]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to stop job.";
        setWsMessages((prev) => [...prev, errorMessage]);
      }
    }
    setJob(null);
    setUrl("");
    setPrompt("");
  };

  // Helper to create a unique key for AnimatePresence when analyserJob changes
  const analyserJobKey =
    job?.results?.analyserJob?.id && job?.results?.analyserJob?.updatedAt
      ? `results-${job.results.analyserJob.id}-${job.results.analyserJob.updatedAt}`
      : "results";

  return (
    <Card className="mb-6 shadow-md dark:bg-gray-850 max-w-4xl mx-auto">
      <AnimatePresence initial={false} mode="wait">
        {!job?.results ? (
          <motion.div
            key="inputs"
            initial={{ opacity: 0, y: 40, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -40, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-row gap-6 p-6">
              {/* Left: Input fields */}
              <div className="flex-1 flex flex-col h-[28rem]">
                <CardHeader>
                  <div className="flex items-center">
                    <PencilLine className="h-5 w-5 mr-2" />
                    <CardTitle className="text-xl">
                      Enter URL and Instructions
                    </CardTitle>
                  </div>
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
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="prompt-input">Extraction Prompt</Label>
                      <Textarea
                        id="prompt-input"
                        placeholder="e.g., Extract all product names and prices."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={10} // Taller input
                        className="h-60 w-[28rem] max-w-full" // Fixed width and height
                        disabled={!!job?.inProgress}
                      />
                    </div>
                  </div>
                  <div>
                    {job?.inProgress ? (
                      <Button
                        onClick={handleStopJob}
                        className="w-full"
                        variant="destructive"
                      >
                        Stop Job
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!url}
                        className="w-full"
                      >
                        Add Scrape Job
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
              {/* Right: WebSocket messages */}
              <div className="flex-1 flex flex-col mt-8">
                <Label className="mb-2 block">Live Messages</Label>
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded h-[24rem] max-h-[28rem] overflow-auto text-xs flex-1">
                  {wsMessages.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={analyserJobKey}
            initial={{ opacity: 0, y: -40, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 40, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Search Again button at the top */}
            <div className="p-4 flex justify-center">
              <Button
                onClick={() => {
                  setJob(null);
                  setUrl("");
                  setPrompt("");
                  setWsMessages([]);
                }}
                className="px-8 py-3 text-lg font-semibold rounded-lg"
                variant="secondary"
                size="lg"
              >
                Analyse Again
              </Button>
            </div>
            <CrawlerResult result={job.results} />
            {job.results.analyserJob?.results && (
              <ExtractedDataDisplay
                extractedData={job.results.analyserJob.results.extracted_data}
                presentationSuggestions={
                  job.results.analyserJob.results.presentation_suggestions
                }
                jobId={job.results.analyserJob.id}
              />
            )}
            {/* Prompt change UI */}
            <div className="p-4 flex flex-col gap-2">
              <label htmlFor="change-prompt-input" className="font-medium">
                Change Prompt &amp; Re-analyse
              </label>
              <Textarea
                id="change-prompt-input"
                placeholder="Enter a new prompt for this job"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                rows={2}
                disabled={changingPrompt}
              />
              <Button
                onClick={async () => {
                  if (!job.results?.analyserJob?.id || !newPrompt) return;
                  setChangingPrompt(true);
                  try {
                    const updatedResults = await changePromtJob(
                      job.results.analyserJob.id.toString(),
                      newPrompt
                    );
                    setJob({
                      ...job,
                      results: {
                        ...job.results,
                        analyserJob: {
                          ...job.results.analyserJob,
                          ...updatedResults,
                        },
                      },
                    });
                    setNewPrompt("");
                  } catch (err) {
                    setWsMessages((prev) => [
                      ...prev,
                      err instanceof Error
                        ? err.message
                        : "Failed to change prompt.",
                    ]);
                  } finally {
                    setChangingPrompt(false);
                  }
                }}
                disabled={changingPrompt || !newPrompt}
                variant="default"
              >
                {changingPrompt ? "Updating..." : "Change Prompt"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
