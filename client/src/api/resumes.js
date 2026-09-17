const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

export async function uploadResume(token, file) {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(res);
}

export async function analyzeResumeApi(token, { resumeText, jobDescription, targetRole }) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/resumes/analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify({ resumeText, jobDescription, targetRole }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (data && data.isValidResume === false && data.errorMessage) {
      return data;
    }
    throw new Error(data.message || "Resume analysis failed");
  }
  return data;
}

