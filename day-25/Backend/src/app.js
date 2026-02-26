const express = require("express")

const cookieparser = require("cookie-parser")

const app = express()
app.use(express.json())
app.use(cookieparser())

// "routes require"
const authRoute = require("./routes/auth.routes")

// use of routes
app.use("/api/auth", authRoute)

module.exports= app