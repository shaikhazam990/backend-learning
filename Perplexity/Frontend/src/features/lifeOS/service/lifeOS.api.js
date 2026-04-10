import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const getSummary = () =>
  api.get("/api/lifeos/summary").then((r) => r.data);
export const getDailyAdvice = () =>
  api.get("/api/lifeos/advice").then((r) => r.data);

export const getHabits = () =>
  api.get("/api/lifeos/habits").then((r) => r.data);
export const createHabit = (data) =>
  api.post("/api/lifeos/habits", data).then((r) => r.data);
export const toggleHabit = (id) =>
  api.patch(`/api/lifeos/habits/${id}/toggle`).then((r) => r.data);
export const deleteHabit = (id) =>
  api.delete(`/api/lifeos/habits/${id}`).then((r) => r.data);

export const getMoods = () => api.get("/api/lifeos/mood").then((r) => r.data);
export const logMood = (data) =>
  api.post("/api/lifeos/mood", data).then((r) => r.data);

export const getSpendings = () =>
  api.get("/api/lifeos/spending").then((r) => r.data);
export const addSpending = (data) =>
  api.post("/api/lifeos/spending", data).then((r) => r.data);
export const deleteSpending = (id) =>
  api.delete(`/api/lifeos/spending/${id}`).then((r) => r.data);
