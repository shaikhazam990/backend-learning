// to run server
// to connect database 

const app = require('./src/app')
const connectToDb = require('./src/config/database')
require("dotenv").config()

connectToDb()



app.listen(3000,()=>{
    console.log("server is running on port 3000");
    
})