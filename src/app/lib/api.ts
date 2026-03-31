const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7ff1470c`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// OpenAI API
export async function generateAIResponse(prompt: string, model: string = 'gpt-3.5-turbo') {
  return fetchAPI('/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, model }),
  });
}

// Sessions
export async function createSession(session: any) {
  return fetchAPI('/sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  });
}

export async function getSessions() {
  return fetchAPI('/sessions');
}

export async function getSession(id: string) {
  return fetchAPI(`/sessions/${id}`);
}

export async function updateSession(id: string, updates: any) {
  return fetchAPI(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSession(id: string) {
  return fetchAPI(`/sessions/${id}`, {
    method: 'DELETE',
  });
}

// Bugs
export async function createBug(bug: any) {
  return fetchAPI('/bugs', {
    method: 'POST',
    body: JSON.stringify(bug),
  });
}

export async function getBugs() {
  return fetchAPI('/bugs');
}

export async function getBug(id: string) {
  return fetchAPI(`/bugs/${id}`);
}

export async function updateBug(id: string, updates: any) {
  return fetchAPI(`/bugs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteBug(id: string) {
  return fetchAPI(`/bugs/${id}`, {
    method: 'DELETE',
  });
}

// Test Cases
export async function createTestCase(testCase: any) {
  return fetchAPI('/testcases', {
    method: 'POST',
    body: JSON.stringify(testCase),
  });
}

export async function getTestCases() {
  return fetchAPI('/testcases');
}

export async function getTestCase(id: string) {
  return fetchAPI(`/testcases/${id}`);
}

export async function updateTestCase(id: string, updates: any) {
  return fetchAPI(`/testcases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTestCase(id: string) {
  return fetchAPI(`/testcases/${id}`, {
    method: 'DELETE',
  });
}

// Analytics
export async function getAnalytics() {
  return fetchAPI('/analytics');
}
