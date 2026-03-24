import { apiFetch, setToken } from "./api";

export async function register(email, password, profession) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, profession }),
  });
  setToken(data.access_token);
  return data;
}

export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function getMe() {
  return apiFetch("/auth/me");
}

export async function updateProfile(updates) {
  return apiFetch("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function logout() {
  setToken(null);
}
