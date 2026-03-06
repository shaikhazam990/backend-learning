const express = require("express");
const likedController = require("../controller/liked.controller");
const { authUser } = require("../middlewares/auth.middleware"); // ← authUser not authMiddleware

const router = express.Router();

// GET    /api/liked/         → get all liked songs for current user
// POST   /api/liked/:songId  → like a song
// DELETE /api/liked/:songId  → unlike a song
// GET    /api/liked/:songId  → check if a specific song is liked

router.get("/",           authUser, likedController.getLikedSongs);
router.post("/:songId",   authUser, likedController.likeSong);
router.delete("/:songId", authUser, likedController.unlikeSong);
router.get("/:songId",    authUser, likedController.checkLiked);

module.exports = router;