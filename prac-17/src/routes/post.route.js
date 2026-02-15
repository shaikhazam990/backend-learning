const express = require("express")

const postRouter = express.Router()

const postController = require("../controllers/post.Controller")

const multer = require("multer")
const upload = multer({Storage: multer.memoryStorage()})

postRouter.post("/" ,upload.single("image"), postController.createPostController )

module.exports=postRouter