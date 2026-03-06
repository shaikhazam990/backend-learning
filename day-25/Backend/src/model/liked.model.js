const mongoose = require("mongoose");

// Each document = one user's liked song
// Combo of userId + songId must be unique — no duplicate likes
const likedSchema = new mongoose.Schema(
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
  { timestamps: true } // createdAt tells us when the song was liked
);

// Prevent same user from liking same song twice
likedSchema.index({ userId: 1, songId: 1 }, { unique: true });

const likedModel = mongoose.model("liked", likedSchema);

module.exports = likedModel;