const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createInterview(token, { company, difficulty }) {
  const res = await fetch(`${API_BASE}/interviews`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ company, difficulty }),
  });
  return handleResponse(res);
}

export async function getMyInterviews(token) {
  const res = await fetch(`${API_BASE}/interviews`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function submitAnswers(token, interviewId, answers) {
  const res = await fetch(`${API_BASE}/interviews/${interviewId}/answers`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ answers }),
  });
  return handleResponse(res);
}

export async function generateFeedback(token, interviewId) {
  const res = await fetch(`${API_BASE}/interviews/${interviewId}/feedback`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
