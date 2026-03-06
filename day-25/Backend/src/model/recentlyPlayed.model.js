const mongoose = require("mongoose");

// Each document = one play event for a user
// We keep last 20 songs per user — older ones delete ho jaate hain
const recentlyPlayedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "songs",
      required: true,
    },
  },
  { timestamps: true } // createdAt = when it was played
);

const recentlyPlayedModel = mongoose.model("recentlyplayed", recentlyPlayedSchema);

module.exports = recentlyPlayedModel;