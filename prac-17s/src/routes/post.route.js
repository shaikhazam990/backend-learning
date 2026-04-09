const express = require("express")

const postRouter = express.Router()

const multer = require("multer")

const upload = multer({storage: multer.memoryStorage()})

const postController = require("../controllers/post.controller")

postRouter.post("/", upload.single("image") , postController.createPostController)

postRouter.get("/", postController.getPostController )

postRouter.get("/details/:postId", postController.getPostDetailController)


module.exports=postRouter