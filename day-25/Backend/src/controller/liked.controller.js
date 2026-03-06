const likedModel = require("../model/liked.model");
const songModel  = require("../model/song.model");

// Like a song
async function likeSong(req, res) {
  const userId = req.user.id; // JWT stores "id" not "_id"
  const { songId } = req.params;

  const song = await songModel.findById(songId);
  if (!song) {
    return res.status(404).json({ message: "Song not found" });
  }

  try {
    await likedModel.create({ userId, songId });
    res.status(201).json({ message: "Song liked", liked: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Song already liked", liked: true });
    }
    throw err;
  }
}

// Unlike a song
async function unlikeSong(req, res) {
  const userId = req.user.id; // JWT stores "id" not "_id"
  const { songId } = req.params;

  await likedModel.deleteOne({ userId, songId });

  res.status(200).json({ message: "Song unliked", liked: false });
}

// Get all liked songs for current user
async function getLikedSongs(req, res) {
  const userId = req.user.id; // JWT stores "id" not "_id"

  const liked = await likedModel
    .find({ userId })
    .populate("songId")
    .sort({ createdAt: -1 });

  const songs = liked
    .filter((l) => l.songId)
    .map((l) => l.songId);

  res.status(200).json({
    message: "Liked songs fetched",
    songs,
  });
}

// Check if a song is liked
async function checkLiked(req, res) {
  const userId = req.user.id; // JWT stores "id" not "_id"
  const { songId } = req.params;

  const exists = await likedModel.findOne({ userId, songId });

  res.status(200).json({ liked: !!exists });
}

module.exports = { likeSong, unlikeSong, getLikedSongs, checkLiked };