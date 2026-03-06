const express = require("express");
const upload = require("../middlewares/upload.middleware");
const songController = require("../controller/song.controller");

const router = express.Router();

// POST /api/songs/         → upload a new song
// GET  /api/songs/         → get one random song by mood (?mood=happy)
// GET  /api/songs/all      → get all songs (optional ?mood= filter)
// GET  /api/songs/albums   → get all albums
// GET  /api/songs/:id      → get a specific song by ID ← new

// IMPORTANT: /all and /albums must be defined BEFORE /:id
// Otherwise express will treat "all" and "albums" as an id

router.post("/",         upload.single("song"), songController.uploadSong);
router.get("/",          songController.getSong);
router.get("/all",       songController.getAllSongs);
router.get("/albums",    songController.getAlbums);
router.get("/:id",       songController.getSongById); // ← must be last

module.exports = router;