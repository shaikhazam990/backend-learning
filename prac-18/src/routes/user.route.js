const express = require ("express")

const followController = require("../controllers/user.controller")
const identifyUser = require("../middlewares/auth.middleware")
const unfollowController = require("../controllers/user.controller")

const userRouter = express.Router()

userRouter.post("/follow/:username", identifyUser, followController.followUserController )
userRouter.post("/unfollow/:username", identifyUser, unfollowController.unfollowUserController )

module.exports=userRouter