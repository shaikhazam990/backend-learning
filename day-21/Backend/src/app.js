const express = require("express")
const cookieparser = require("cookie-parser")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cookieparser())
app.use(cors({
    credentials:true,
    origin:"http://localhost:5173",
    methods: [ "GET", "POST", "PUT", "DELETE" ],
}))

//   require routes
const postRouter = require("./routes/post.route")
const authRouter = require("./routes/auth.route")
const userRouter = require("./routes/user.route")


// using routes
app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)
app.use("/api/users", userRouter)

module.exports=app