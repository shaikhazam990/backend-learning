const express = require("express")
const upload = require("../middlewares/upload.middleware")
const songController = require("../controller/song.controller")
const router = express.Router()

// post /api/songs/
router.post("/", upload.single("song"),songController.uploadSong)
router.get("/", songController.getSong)

module.exports=router