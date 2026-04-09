const express = require("express")
const cookieparser = require("cookie-parser")

const app = express()
app.use(express.json())
app.use(cookieparser())

// require router
const postRouter = require("./routes/post.route")
const authRouter = require("./routes/auth.route")
const userRouter = require("./routes/user.route")


//  use router
app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)
app.use("/api/users", userRouter)

module.exports=app