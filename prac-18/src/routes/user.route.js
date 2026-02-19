const express = require ("express")

const followController = require("../controllers/user.controller")
const identifyUser = require("../middlewares/auth.middleware")

const userRouter = express.Router()

userRouter.post("/follow/:username", identifyUser, followController.followUserController )

module.exports=userRouter