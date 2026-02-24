const express = require("express")

const postController = require("../controllers/post.controller")
const multer = require("multer")
const upload = multer({storage: multer.memoryStorage()})
const postRouter = express.Router()
const identifyUser = require("../middlewares/auth.middleware")


postRouter.post("/", identifyUser, upload.single("image"),postController.CreatePostController)

// GET api/posts/ [protected]

postRouter.get("/",identifyUser, postController.getPostController)

// api/posts/details/id of that user want to fetch

postRouter.get("/details/:postId",identifyUser, postController.getPostDetailsController)


postRouter.post("/like/:postId", identifyUser, postController.likePostController)

// get => /api/posts/feed

postRouter.get("/feed", identifyUser, postController.getFeedController)


module.exports=postRouter