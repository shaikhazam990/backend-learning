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

// use of routes
app.use("/api/auth", authRoute)

module.exports= app