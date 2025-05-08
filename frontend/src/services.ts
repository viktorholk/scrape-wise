const API_BASE_URL = 'http://localhost:8000';

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