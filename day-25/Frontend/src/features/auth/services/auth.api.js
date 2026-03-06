import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
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