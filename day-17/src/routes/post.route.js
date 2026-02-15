const express = require("express")

const postController = require("../controllers/post.controller")
const multer = require("multer")
const upload = multer({storage: multer.memoryStorage()})
const postRouter = express.Router()

postRouter.post("/", upload.single("image"), postController.CreatePostController)

module.exports=postRouter