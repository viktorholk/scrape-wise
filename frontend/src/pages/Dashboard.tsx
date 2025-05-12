import React from 'react';

interface ScraperJob {
  id: number;
  name: string;
  status: string;
  lastRun: string;
}

const mockScraperJobs: ScraperJob[] = [
  { id: 1, name: 'Job 1', status: 'Completed', lastRun: '2023-10-01' },
  { id: 2, name: 'Job 2', status: 'Running', lastRun: '2023-10-02' },
  { id: 3, name: 'Job 3', status: 'Failed', lastRun: '2023-10-03' },
];

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Scraper Jobs Dashboard</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Run</th>
          </tr>
        </thead>
        <tbody>
          {mockScraperJobs.map((job) => (
            <tr key={job.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.status}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.lastRun}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;