const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3010/api' : '/api';

/**
 * Retrieves the authentication token from cookies.
 * @returns The token string or null if not found.
 */
export function getAuthToken(): string | null {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1] || null;
}

/**
 * Sends a POST request to the /crawler endpoint to add a scrape job.
 * @param url - The URL to scrape.
 * @param prompt - The extraction prompt.
 * @param depth - The crawl depth.
 * @param limit - The page limit.
 * @returns The response data from the server.
 */
export async function addScrapeJob(url: string, prompt: string, depth: number, limit: number) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/crawler-jobs?analyse=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
    body: JSON.stringify({ url, prompt, depth, limit }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Sends a POST request to the /crawler endpoint to add a scrape job.
 * @param jobId - The URL to scrape.
 * @param prompt - The extraction prompt.
 * @returns The response data from the server.
 */
export async function changePromtJob(jobId: string, prompt: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/crawler-jobs/${jobId}/analyse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
    body: JSON.stringify({prompt}),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Sends a POST request to the /auth endpoint for user login.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The response data from the server.
 */
export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Login failed');
  }

  return response.json();
}

/**
 * Sends a POST request to the /users endpoint for user registration.
 * @param userData - The user's registration data.
 * @returns The response data from the server.
 */
export async function registerUser(userData: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Registration failed');
  }

  return response.json();
}

/**
 * Retrieves all jobs created by the authenticated user.
 * @returns The list of jobs from the server.
 */
export async function getUserJobs(page = 1, limit = 10) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/crawler-jobs?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Updates the authenticated user's information.
 * @param userData - The user's updated data.
 * @returns The updated user data from the server.
 */
export async function updateUser(userData: {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to update user');
  }

  return response.json();
}

/**
 * Stops a running job by its ID.
 * @param jobId - The job's ID.
 * @returns The response data from the server.
 */
export async function stopJob(jobId: number) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/stop`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to stop job');
  }

  return response.json();
}

/**
 * Decodes a JWT token and returns its payload.
 */
function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Checks if the JWT token is expired.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Creates a new scheduled analysis and links it to an analyser job.
 * @param scheduledAnalysis - The data including analyserJobId.
 * @returns The created scheduled analysis from the server.
 */
export async function setScheduledAnalysis(scheduledAnalysis: {
  name: string;
  cronExpression: string;
  prompt: string;
  originalAnalysisJobId: number;
}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/scheduled-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(scheduledAnalysis),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to create scheduled analysis');
  }

  return response.json();
}

/**
 * Retrieves all scheduled analyses for the authenticated user.
 * @returns The scheduled analyses from the server.
 */
export async function getScheduledAnalysis() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/scheduled-analysis`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to fetch scheduled analyses');
  }

  return response.json();
}

/**
 * Retrieves all analyser jobs for the authenticated user.
 * @returns The analyser jobs from the server.
 */
export async function getAnalyserJobs() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/analyser-jobs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to fetch analyser jobs');
  }

  return response.json();
}

/**
 * Retrieves all analyser jobs for a specific crawler job ID for the authenticated user.
 * @param crawlerJobId - The crawler job's ID.
 * @returns The analyser jobs from the server.
 */
export async function getAnalyserJobsForCrawlerJob(crawlerJobId: number) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/analyser-jobs/by-crawler/${crawlerJobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to fetch analyser jobs for crawler job');
  }

  return response.json();
}

/**
 * Updates a scheduled analysis job.
 * @param id - The scheduled job's ID.
 * @param updates - The fields to update (name, cronExpression, prompt, enabled).
 * @returns The updated scheduled job from the server.
 */
export async function updateScheduledAnalysisJob(
  id: number,
  updates: {
    name?: string;
    cronExpression?: string;
    prompt?: string;
    enabled?: boolean;
  }
) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/scheduled-analysis/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to update scheduled analysis job');
  }

  return response.json();
}

/**
 * Deletes a scheduled analysis job.
 * @param id - The scheduled job's ID.
 */
export async function deleteScheduledAnalysisJob(id: number) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/scheduled-analysis/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const { message } = await response.json().catch(() => ({}));
    throw new Error(message || 'Failed to delete scheduled analysis job');
  }
}

