import axios from "axios";

// Single axios instance for all auth API calls
// withCredentials: true → sends cookies so backend can verify JWT
const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export async function register({ username, password, email }) {
  const response = await api.post("/api/auth/register", {
    username,
    password,
    email,
  });
  return response.data;
}

export async function login({ email, username, password }) {
  const response = await api.post("/api/auth/login", {
    email,
    username,
    password,
  });
  return response.data;
}

// getMe has a 3 second timeout
// On page refresh, if backend is slow or not running,
// we don't want the app to hang forever on a blank screen
export async function getMe() {
  const response = await api.get("/api/auth/get-me", {
    timeout: 3000,
  });
  return response.data;
}

export async function logout() {
  const response = await api.get("/api/auth/logout");
  return response.data;
}