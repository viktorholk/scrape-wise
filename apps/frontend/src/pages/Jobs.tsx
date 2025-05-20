import { useEffect, useState } from "react";
import { getUserJobs } from "@/services"; // Import the service function
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import the Table components
import React from "react";

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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // <-- Add this line

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getUserJobs();
        setJobs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex flex-row p-4">
      {/* Left Side: Table */}
      <div className="w-1/2 pr-4">
        <Card className="shadow-md dark:bg-gray-850 w-full">
          <CardHeader>
            <CardTitle className="text-xl text-center">Your Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length === 0 ? (
              <p>No jobs found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Initial URL</TableHead>
                    <TableHead>Job Count</TableHead>
                    <TableHead>Latest Status</TableHead>
                    <TableHead>Latest Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(jobsByUrl).map(([url, jobsForUrl]) => {
                    // Sort jobs by createdAt descending
                    const sortedJobs = [...jobsForUrl].sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                    const latestJob = sortedJobs[0];
                    const expanded = expandedUrls[url] || false;
                    return (
                      <React.Fragment key={url}>
                        <TableRow
                          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() =>
                            setExpandedUrls((prev) => ({
                              ...prev,
                              [url]: !prev[url],
                            }))
                          }
                        >
                          <TableCell>
                            <span className="mr-2">
                              {expanded ? "▼" : "▶"}
                            </span>
                            {url}
                          </TableCell>
                          <TableCell>{jobsForUrl.length}</TableCell>
                          <TableCell>{latestJob.status}</TableCell>
                          <TableCell>
                            {new Date(latestJob.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                        {expanded &&
                          sortedJobs.map((job) => (
                            <TableRow
                              key={job.id}
                              className="bg-gray-100 dark:bg-gray-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                              }}
                            >
                              <TableCell colSpan={4}>
                                <div className="flex flex-col gap-1">
                                  <span>
                                    <strong>Job ID:</strong> {job.id}
                                  </span>
                                  <span>
                                    <strong>Status:</strong> {job.status}
                                  </span>
                                  <span>
                                    <strong>Created At:</strong>{" "}
                                    {new Date(job.createdAt).toLocaleString()}
                                  </span>
                                  <button
                                    className="text-blue-600 underline w-fit"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedJob(job);
                                    }}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Job Details */}
      <div className="w-1/2 pl-4">
        {selectedJob ? (
          <Card className="shadow-md dark:bg-gray-850 w-full">
            <CardHeader>
              <CardTitle className="text-xl text-center">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Job ID:</strong> {selectedJob.id}
              </p>
              <div>
                <strong>Results:</strong>
                {selectedJob.pages && selectedJob.pages.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {selectedJob.pages.map((result, index) => (
                      <li key={index}>
                        <p>
                          <strong>URL:</strong> {result.url}
                        </p>
                        <p>
                          <strong>Title:</strong>{" "}
                          {result.title || "No title available"}
                        </p>
                        <p>
                          <strong>Links Found:</strong> {result.linksFound}
                        </p>
                        <p>
                          <strong>Text Content:</strong>{" "}
                          {result.textContent.slice(0, 100)}...
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No results available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md dark:bg-gray-850 w-full">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Select a Job
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center">
                Click on a job in the table to view its details.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
