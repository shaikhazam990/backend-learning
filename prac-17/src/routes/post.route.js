const express = require("express")

const postRouter = express.Router()

const postController = require("../controllers/post.Controller")

const multer = require("multer")
const { post } = require("./user.route")
const upload = multer({Storage: multer.memoryStorage()})

postRouter.post("/" ,upload.single("image"), postController.createPostController )

postRouter.get("/",postController.getPostController )

postRouter.get("/details/:postId", postController.getpostDetailsController)

module.exports=postRouter