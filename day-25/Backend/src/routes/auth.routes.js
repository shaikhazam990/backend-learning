const express = require("express")
const authController = require("../controller/auth.controller")
const authMiddlewares = require("../middlewares/auth.middleware")

const authRouter = express.Router()


authRouter.post("/register",authController.registerController)
authRouter.post("/login", authController.loginController)

authRouter.get("/get-me", authMiddlewares.authUser,authController.getMeController)
authRouter.get("/logout", authController.logoutController)

module.exports=authRouter