import { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanSearch, Loader2, CheckCircle, AlertTriangle, PencilLine, FileText, Download } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addScrapeJob } from '@/services'; // Import the service function
import { ws } from '@/App';

interface ScrapeJob {
  id: string;
  url: string;
  prompt: string;
  status: 'loading' | 'completed' | 'error';
  results?: any;
  error?: string;
}

export default function ScraperSearch() {
  const [url, setUrl] = useState('https://www.scrapethissite.com/pages/simple/');
  const [prompt, setPrompt] = useState('Extract all countries');
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);

  const updateJobStatus = useCallback((id: string, status: ScrapeJob['status'], data?: any) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === id
          ? { ...job, status, results: status === 'completed' ? data : undefined, error: status === 'error' ? data : undefined }
          : job
      )
    );
  }, []);

  const handleSubmit = async () => {
    if (!url) return;

    try {
      const data = await addScrapeJob(url, prompt); // Use the service function


      const newJob: ScrapeJob = {
        id: data.jobId,
        url,
        prompt,
        status: 'loading',
      };

    setJobs(prevJobs => [newJob, ...prevJobs]);

      console.log(data)
      console.log(`Job ${newJob.id} completed successfully.`, data);
      updateJobStatus(newJob.id, 'completed', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to scrape the URL.';
    }
  };

  return (
    <div className=" flex flex-col items-center p-4">
      <header className="w-full max-w-4xl mb-8 flex items-center justify-center py-4 border-b border-gray-300 dark:border-gray-700">
        <ScanSearch className="h-8 w-8 mr-3 text-blue-600 dark:text-blue-400" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
          Scrape Wise
        </h1>
      </header>

      <main className="w-full">
        <Card className="mb-6 shadow-md dark:bg-gray-850 max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center">
              <PencilLine className="h-5 w-5 mr-2" />
              <CardTitle className="text-xl">Enter URL and Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">Website URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-input">Extraction Prompt</Label>
              <Textarea
                id="prompt-input"
                placeholder="e.g., Extract all product names and prices."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} disabled={!url} className="w-full">
              Add Scrape Job
            </Button>
          </CardContent>
        </Card>

        {/* Container for displaying scrape job cards - switched to Flexbox */}
        <div className="w-full  flex flex-wrap justify-center"> {/* Use flex, wrap, and center. Adjusted padding */}
          {jobs.length === 0 && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
              No scrape jobs added yet. Add one using the form above.
            </div>
          )}
          {jobs.map((job) => (
            // Placeholder for the ScrapeJobCard component
            // Added width classes and padding to simulate grid columns/gap
            <div key={job.id} className="w-full md:w-1/2 lg:w-1/3 p-2"> 
              <Card className="dark:bg-gray-850 shadow-md flex flex-col h-full"> {/* Ensure card fills the div height */}
                <CardHeader>
                  <div className="flex items-center"> {/* Flex container for icon + title */}
                    <FileText className="h-4 w-4 mr-2" />
                    <CardTitle className="text-sm truncate">Job: {job.id}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow min-h-[180px] flex flex-col justify-between">
                  <div>
                    <p className="text-xs truncate mb-1">URL: {job.url}</p>
                    <p className="text-xs truncate mb-2">Prompt: {job.prompt || '-'}</p>
                  </div>
                  <div className="mt-2">
                    {job.status === 'loading' && (
                      <div className="flex items-center text-xs text-yellow-500">
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading...
                      </div>
                    )}
                    {job.status === 'completed' && (
                      <div className="flex items-center text-xs text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" /> Completed
                      </div>
                    )}
                    {job.status === 'error' && (
                      <div className="flex items-center text-xs text-red-500">
                        <AlertTriangle className="h-4 w-4 mr-1" /> Error
                      </div>
                    )}
                  </div>
                  {/* TODO: Display actual results here */} 
                </CardContent>

                <CardFooter>
                  <Button variant="outline" onClick={() => {
                    console.log("Stopping job:", job.id);
                    ws.send(JSON.stringify({
                      type: 'crawler_job_stop',
                      jobId: job.id
                    }))
                  }}>
                    <Download className="h-4 w-4 mr-1" /> Stop
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full max-w-4xl mt-8 pt-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
        © {new Date().getFullYear()} Scrape Wise - Simple Web Scraping
      </footer>
    </div>
  );
}
