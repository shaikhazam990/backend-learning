const express = require("express")
const authRouter = require("./routes/user.route")
const cookieparser = require("cookie-parser")
const postController = require("./routes/post.route")

const app = express()
app.use(express.json())
app.use(cookieparser())

app.use("/api/auth", authRouter)
app.use("/api/post", authRouter)
app.use("/api/posts", postController)

module.exports=app