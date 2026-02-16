const express = require("express")

const authRouter = express.Router()

const userController = require("../controllers/user.controller")

authRouter.post("/register",userController.registerController)

module.exports=authRouter