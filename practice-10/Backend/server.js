require("dotenv").config()
const app = require("./src/app")
const connectedToDb = require("./src/config/database")

connectedToDb()

app.listen(9000,()=>{
    console.log("server is running on port 9000")
})