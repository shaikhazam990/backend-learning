const express = require("express");
const router  = express.Router();

// PUT YOUR NEW API KEY in your .env file as YOUTUBE_API_KEY
// NEVER hardcode API keys in code!

// GET /api/youtube/search?q=sad+songs
router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url    = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&q=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await fetch(url);
    const data     = await response.json();

    if (!response.ok) {
      return res.status(500).json({ message: "YouTube API error", error: data });
    }

    // Clean up the data - sirf jo chahiye woh bhejo
    const videos = data.items.map((item) => ({
      videoId:   item.id.videoId,
      title:     item.snippet.title,
      channel:   item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json({ videos });
  } catch (err) {
    console.error("YouTube search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;