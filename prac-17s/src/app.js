const express = require("express")

const cookieparser = require("cookie-parser")

const authRouter = require("./routes/user.route")
const app = express()
app.use(express.json())
app.use(cookieparser())

app.use("/api/auth", authRouter)

app.use("/api/posts",authRouter)

module.exports=app