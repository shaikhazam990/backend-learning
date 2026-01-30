const mongoose = require('mongoose')

function ConnectToDb(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("connectd to database");
        
    })
}

module.exports= ConnectToDb