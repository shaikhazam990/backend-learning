import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Get recently played songs for current user
export async function getRecentlyPlayed() {
  const response = await api.get("/api/recent");
  return response.data;
}

// Add a song to recently played
export async function addRecentlyPlayed(songId) {
  const response = await api.post(`/api/recent/${songId}`);
  return response.data;
}