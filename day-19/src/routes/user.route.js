const express = require("express")

const UserController = require("../controllers/user.controller")
const identifyUser = require("../middlewares/auth.middleware")

const userRouter = express.Router()


// @route = post/api/users/follow/:userid
// @description = follow a user
// @access = private


userRouter.post("/follow/:username", identifyUser,UserController.followUserController)

userRouter.post("/unfollow/:username", identifyUser, UserController.unfollowUserController)


module.exports=userRouter