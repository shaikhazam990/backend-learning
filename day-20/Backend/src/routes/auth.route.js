const express = require("express")

const userController = require("../controllers/auth.controller")

const authRouter = express.Router()

authRouter.post("/register", userController.registerController)
authRouter.post("/login",userController.loginController )

module.exports = authRouter