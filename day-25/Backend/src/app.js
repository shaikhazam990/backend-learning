const express = require("express")

const cookieparser = require("cookie-parser")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cookieparser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))

// "routes require"
const authRoute = require("./routes/auth.routes")
const songRouter = require("./routes/song.routes")

// use of routes
app.use("/api/auth", authRoute)
app.use("/api/songs", songRouter)

module.exports= app