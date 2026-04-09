const express = require("express")

const authRouter = express.Router()

const userController = require("../controllers/user.controller")

authRouter.post("/register",userController.registerController)

authRouter.post("/login", userController.loginController)

module.exports=authRouter