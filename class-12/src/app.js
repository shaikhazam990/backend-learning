const express = require("express")
const connectToDb = require("./config/database")

connectToDb()

const app = express()
app.use(express.json())

module.exports=app