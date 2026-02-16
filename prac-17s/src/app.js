const express = require("express")

const cookieparser = require("cookie-parser")

const authRouter = require("./routes/user.route")
const postRouter = require("./routes/post.route")


const app = express()
app.use(express.json())
app.use(cookieparser())

app.use("/api/auth", authRouter)
app.use("/api/posts",postRouter)

app.use("/api/posts", postRouter)



module.exports=app