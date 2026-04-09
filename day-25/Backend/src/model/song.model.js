const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  posterUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  // Artist name extracted from ID3 tags when song is uploaded
  artist: {
    type: String,
    default: "Unknown Artist",
  },
  mood: {
    type: String,
    enum: {
      values: ["sad", "happy", "surprised", "angry", "neutral"],
      message: "{VALUE} is not a valid mood",
    },
  },
});

const songModel = mongoose.model("songs", songSchema);

module.exports = songModel;