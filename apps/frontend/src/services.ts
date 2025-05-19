const API_BASE_URL = 'http://localhost:3010';

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
 * @returns The response data from the server.
 */
export async function addScrapeJob(url: string, prompt: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/crawler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
    },
    body: JSON.stringify({ url, prompt }),
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

  const response = await fetch(`${API_BASE_URL}/crawler/${jobId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
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
export async function getUserJobs() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
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
      'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
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
 * Sets the preferred template for a specific job.
 * @param jobId - The job's ID.
 * @param templateType - The template type to set (e.g., "TABLE", "LIST_VIEW", "BAR_CHART").
 * @returns The updated job data from the server.
 */
export async function setJobTemplate(jobId: number, templateType: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/template`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ templateType }),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message || 'Failed to set job template');
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
  // exp is in seconds
  return Date.now() >= payload.exp * 1000;
}

