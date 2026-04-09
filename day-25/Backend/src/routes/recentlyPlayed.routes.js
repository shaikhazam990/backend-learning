const express = require("express");
const recentlyPlayedController = require("../controller/recentlyPlayed.controller");
const { authUser } = require("../middlewares/auth.middleware");

const router = express.Router();

// GET  /api/recent/         → get recently played songs
// POST /api/recent/:songId  → add a song to recently played

router.get("/",          authUser, recentlyPlayedController.getRecentlyPlayed);
router.post("/:songId",  authUser, recentlyPlayedController.addRecentlyPlayed);

module.exports = router;