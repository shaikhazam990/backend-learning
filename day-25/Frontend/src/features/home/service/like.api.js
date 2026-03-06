import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Get all liked songs for current user
export async function getLikedSongs() {
  const response = await api.get("/api/liked");
  return response.data;
}

// Like a song
export async function likeSong(songId) {
  const response = await api.post(`/api/liked/${songId}`);
  return response.data;
}

// Unlike a song
export async function unlikeSong(songId) {
  const response = await api.delete(`/api/liked/${songId}`);
  return response.data;
}

// Check if a song is liked
export async function checkLiked(songId) {
  const response = await api.get(`/api/liked/${songId}`);
  return response.data;
}