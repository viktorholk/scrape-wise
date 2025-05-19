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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const result = await getUserJobs(); // Fetch jobs from the service
        setJobs(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

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
                    <TableHead>Job ID</TableHead>
                    <TableHead>Initial URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setSelectedJob(job)}
                    >
                      <TableCell>{job.id}</TableCell>
                      <TableCell>{job.initialUrl}</TableCell>
                      <TableCell>{job.status}</TableCell>
                      <TableCell>
                        {new Date(job.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
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
              </p>{" "}
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
                          {result.textContent?.slice(0, 100)}...
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
