const express = require("express")
const authRouter = require("./user.routes")
const postController = require("../controllers/post.controller")
const mutter = require("multer")
const multer = require("multer")

const postRouter = express.Router()
const upload = multer({Storage: multer.memoryStorage()})

postRouter.post("/" ,upload.single("image") , postController.createPostController )

module.exports=postRouter