const express = require("express")
const authRoutes = require("../src/routes/auth.route")
const cookieparser = require("cookie-parser")

const app = express ()
app.use(express.json())
app.use(cookieparser())
app.use("/api/auth", authRoutes)

module.exports= app