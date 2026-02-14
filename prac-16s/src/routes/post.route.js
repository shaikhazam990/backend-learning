const express = require("express")
const postcontroller = require("../controllers/post.controller")

const postRouter = express.Router()

const multer = require("multer")
const upload = multer({storage: multer.memoryStorage()})

postRouter.post("/", upload.single("chacha"), postcontroller.CreatePostController)

module.exports=postRouter