const express = require("express")
const authRouter = require("./routes/user.routes")
const cookieparser = require("cookie-parser")

const postRouter = require("./routes/post.routes")
const app = express()

app.use(express.json())
app.use(cookieparser())

app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)

module.exports=app