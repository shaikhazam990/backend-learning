import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Get one random song by mood — called after face detection
export async function getSong({ mood }) {
  const response = await api.get("/api/songs?mood=" + mood);
  return response.data;
}

// Get a specific song by ID — cache busted with timestamp
// Without this, browser returns 304 Not Modified with no body
// and data.song becomes undefined — song doesn't play
export async function getSongById(songId) {
  const response = await api.get(`/api/songs/${songId}?t=${Date.now()}`);
  return response.data;
}

// Get all songs — optional mood filter
export async function getAllSongs({ mood } = {}) {
  const url = mood ? `/api/songs/all?mood=${mood}` : "/api/songs/all";
  const response = await api.get(url);
  return response.data;
}

// Get all albums (each song = one album card)
export async function getAlbums() {
  const response = await api.get("/api/songs/albums");
  return response.data;
}