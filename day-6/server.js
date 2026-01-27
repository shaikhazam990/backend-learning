const app = require('./src/app')
const mongoose = require("mongoose")


function ConnectToDb (){
    mongoose.connect("mongodb+srv://azam:Azam@cluster0.7gmdqcv.mongodb.net/")
    .then(()=>{
        console.log("connected to Database")
    })
}

ConnectToDb()

app.listen(3000,()=>{
    console.log("server is running on port 3000");
    
})
