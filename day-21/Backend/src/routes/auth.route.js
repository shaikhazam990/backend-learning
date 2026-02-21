const express = require("express")

const AuthController = require("../controllers/auth.controller")
const identifyUser = require("../middlewares/auth.middleware")

const authRouter = express.Router()

authRouter.post("/register", AuthController.registerController)
authRouter.post("/login",AuthController.loginController )
authRouter.get("/get-me",identifyUser,AuthController.getMeController)

module.exports = authRouter