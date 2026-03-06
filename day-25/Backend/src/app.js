const express = require("express");
const cookieparser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// ── Routes ────────────────────────────────────────────────
const authRoute            = require("./routes/auth.routes");
const songRouter           = require("./routes/song.routes");
const likedRouter          = require("./routes/like.routes");
const recentlyPlayedRouter = require("./routes/recentlyPlayed.routes");
const youtubeRouter        = require("./routes/youtube.routes"); // ✅ YouTube

app.use("/api/auth",    authRoute);
app.use("/api/songs",   songRouter);
app.use("/api/liked",   likedRouter);
app.use("/api/recent",  recentlyPlayedRouter);
app.use("/api/youtube", youtubeRouter); // ✅ YouTube

module.exports = app;