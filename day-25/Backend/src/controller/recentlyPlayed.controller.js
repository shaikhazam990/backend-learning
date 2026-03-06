const recentlyPlayedModel = require("../model/recentlyPlayed.model");

// Save a song as recently played
// Called every time a song starts playing
async function addRecentlyPlayed(req, res) {
  const userId = req.user.id;
  const { songId } = req.params;

  // Remove old entry of same song if exists — so it moves to top
  await recentlyPlayedModel.deleteOne({ userId, songId });

  // Add fresh entry at top
  await recentlyPlayedModel.create({ userId, songId });

  // Keep only last 20 songs — delete older ones
  const all = await recentlyPlayedModel
    .find({ userId })
    .sort({ createdAt: -1 });

  if (all.length > 20) {
    const oldIds = all.slice(20).map((r) => r._id);
    await recentlyPlayedModel.deleteMany({ _id: { $in: oldIds } });
  }

  res.status(201).json({ message: "Added to recently played" });
}

// Get recently played songs for current user
async function getRecentlyPlayed(req, res) {
  const userId = req.user.id;

  const recent = await recentlyPlayedModel
    .find({ userId })
    .populate("songId")
    .sort({ createdAt: -1 }) // newest first
    .limit(20);

  // Filter out deleted songs
  const songs = recent
    .filter((r) => r.songId)
    .map((r) => r.songId);

  res.status(200).json({
    message: "Recently played fetched",
    songs,
  });
}

module.exports = { addRecentlyPlayed, getRecentlyPlayed };