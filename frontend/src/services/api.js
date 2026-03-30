const BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("llm-academy-token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("llm-academy-token", token);
  } else {
    localStorage.removeItem("llm-academy-token");
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (resp.status === 401) {
    // Only redirect to login if the user had a token (expired session).
    // Anonymous requests (no token) should just throw without redirect.
    if (token) {
      setToken(null);
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${resp.status}`);
  }

  return resp.json();
}
