const express = require("express")

const postController = require("../controllers/post.controller")
const multer = require("multer")
const upload = multer({storage: multer.memoryStorage()})
const postRouter = express.Router()

postRouter.post("/", upload.single("image"), postController.CreatePostController)

// GET api/posts/ [protected]

postRouter.get("/", postController.getPostController)

// api/posts/details/id of that user want to fetch

postRouter.get("/details/:postId" , postController.getPostDetailsController)


module.exports=postRouter