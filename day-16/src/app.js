const express = require("express")
const authRouter = require("./routes/user.route")

const app = express()
app.use(express.json())

module.exports=app