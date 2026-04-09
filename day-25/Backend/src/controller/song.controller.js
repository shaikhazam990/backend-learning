const songModel = require("../model/song.model");
const storageService = require("../services/storage.service");
const id3 = require("node-id3");

// Upload a new song
async function uploadSong(req, res) {
  const songBuffer = req.file.buffer;
  const { mood } = req.body;

  const tags = id3.read(songBuffer);

  const [songFile, posterFile] = await Promise.all([
    storageService.uploadFile({
      buffer: songBuffer,
      filename: tags.title + ".mp3",
      folder: "/cohort-2/moodify/songs",
    }),
    storageService.uploadFile({
      buffer: tags.image.imageBuffer,
      filename: tags.title + ".jpeg",
      folder: "/cohort-2/moodify/posters",
    }),
  ]);

  const song = await songModel.create({
    title: tags.title,
    artist: tags.artist || "Unknown Artist",
    url: songFile.url,
    posterUrl: posterFile.url,
    mood,
  });

  res.status(201).json({ message: "Song created successfully", song });
}

// Get one random song by mood — used after face detection
async function getSong(req, res) {
  const { mood } = req.query;

  const songs = await songModel.find({ mood });

  if (!songs.length) {
    return res.status(404).json({ message: "No songs found for this mood" });
  }

  const song = songs[Math.floor(Math.random() * songs.length)];

  res.status(200).json({ message: "Song fetched successfully", song });
}

// Get a specific song by ID — used when user clicks a song row directly
async function getSongById(req, res) {
  const { id } = req.params;

  const song = await songModel.findById(id);

  if (!song) {
    return res.status(404).json({ message: "Song not found" });
  }

  res.status(200).json({ message: "Song fetched successfully", song });
}

// Get ALL songs — used by Songs section
async function getAllSongs(req, res) {
  const { mood } = req.query;

  const filter = mood ? { mood } : {};
  const songs = await songModel.find(filter).sort({ title: 1 });

  res.status(200).json({ message: "Songs fetched successfully", songs });
}

// Get albums — each song is its own album card
async function getAlbums(req, res) {
  const songs = await songModel.find({}).sort({ title: 1 });

  const albums = songs.map((song) => ({
    _id:       song._id,
    title:     song.title,
    artist:    song.artist || "Unknown Artist",
    posterUrl: song.posterUrl,
    url:       song.url,
    mood:      song.mood,
  }));

  res.status(200).json({ message: "Albums fetched successfully", albums });
}

module.exports = { uploadSong, getSong, getSongById, getAllSongs, getAlbums };