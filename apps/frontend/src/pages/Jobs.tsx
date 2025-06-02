import { useEffect, useState } from "react";
import { getUserJobs, getAnalyserJobsForCrawlerJob } from "@/services"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 
import { Button } from "@/components/ui/button"; 
import { Globe, CalendarClock, FileText, Loader2, CheckCircle2, XCircle, AlertTriangle, List } from "lucide-react";
import { CrawlerResult } from "@/components/CrawlerResult";
import { AnalyserResult } from "@/components/AnalyserResult"; 
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ListTree } from "lucide-react";

interface Job {
  id: number;
  initialUrl: string;
  crawlDepth: number;
  pageLimit: number;
  status: string;
  pages?: Array<{
    url: string;
    title: string;
    linksFound: number;
    textContent: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUrls, setExpandedUrls] = useState<Record<string, boolean>>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); 
  const [analyserJobs, setAnalyserJobs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const result = await getUserJobs(page, limit);
        setJobs(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, limit]);

  useEffect(() => {
    if (selectedJob) {
      getAnalyserJobsForCrawlerJob(selectedJob.id)
        .then((jobs) => {
          setAnalyserJobs(Array.isArray(jobs) ? jobs : jobs ? [jobs] : []);
        })
        .catch(() => setAnalyserJobs([]));
    } else {
      setAnalyserJobs([]);
    }
  }, [selectedJob]);

  // Group jobs by initialUrl
  const jobsByUrl = jobs.reduce<Record<string, Job[]>>((acc, job) => {
    if (!acc[job.initialUrl]) acc[job.initialUrl] = [];
    acc[job.initialUrl].push(job);
    return acc;
  }, {});

  if (loading) {
    return <p>Loading jobs...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <List className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground">
            View and manage your crawl and analysis jobs. Click a job to see details.
          </p>
        </div>
      </div>
      <div className="flex flex-row gap-6">
        {/* Left: Jobs List */}
        <div className="w-1/2 flex flex-col gap-6">
          <Card className="shadow-md dark:bg-gray-850 w-full">
            <CardHeader>
              <CardTitle className="text-xl text-center">Your Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
                  <List className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Jobs Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a new analysis to see jobs here.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Initial URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow
                          key={job.id}
                          className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${selectedJob?.id === job.id ? "bg-muted" : ""}`}
                          onClick={() => setSelectedJob(job)}
                        >
                          <TableCell className="truncate max-w-[180px]" title={job.initialUrl}>
                            <Globe className="inline h-4 w-4 mr-1 text-muted-foreground" />
                            {job.initialUrl}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                              job.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : job.status === "STARTED"
                                ? "bg-blue-100 text-blue-700"
                                : job.status === "ERROR"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {job.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
                              {job.status === "STARTED" && <Loader2 className="h-3 w-3 animate-spin" />}
                              {job.status === "ERROR" && <AlertTriangle className="h-3 w-3" />}
                              {job.status !== "COMPLETED" && job.status !== "STARTED" && job.status !== "ERROR" && <XCircle className="h-3 w-3" />}
                              {job.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <CalendarClock className="inline h-4 w-4 mr-1 text-muted-foreground" />
                            {new Date(job.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Pagination controls */}
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      variant="secondary"
                    >
                      Previous
                    </Button>
                    <span className="self-center">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      variant="secondary"
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Right: Job Details and Results */}
        <div className="w-1/2 flex flex-col gap-6">
          {selectedJob ? (
            <>
              <CrawlerResult result={{ crawlerJob: selectedJob }} />
              {/* Collapsed Analyser Results */}
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl gap-3">
                    <ListTree className="h-6 w-6 mr-2 text-purple-500" />
                    <span className="tracking-wide">All Analysis Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {analyserJobs.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-4 mt-2">
                      {analyserJobs.map((aj) => (
                        <AccordionItem
                          value={`analyser-${aj.id}`}
                          key={aj.id}
                          className="mb-2 border rounded-lg bg-muted/40 shadow-sm"
                        >
                          <AccordionTrigger className="text-base font-semibold px-4 py-3">
                            <span>
                              <span className="font-mono text-purple-700">#{aj.id}</span> – {aj.status}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 pb-4">
                            <AnalyserResult analyserJob={aj} />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-4">
                      <h3 className="text-base font-semibold mb-2">No Analysis Results</h3>
                      <p className="text-muted-foreground mb-2">
                        No analyser jobs found for this crawl job.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-md dark:bg-gray-850 w-full flex items-center justify-center h-full min-h-[300px]">
              <CardContent>
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Job</h3>
                  <p className="text-muted-foreground mb-4">
                    Click on a job in the table to view its details and results.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
