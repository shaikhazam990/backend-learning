const express = require("express")
const postRouter = express.Router()
const postController = require("../controllers/post.controller")
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })


postRouter.post("/", upload.single("chacha") ,postController.createPostController)


module.exports= postRouter