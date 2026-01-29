const mongoose = require("mongoose")

function ConnectToDb(){
    mongoose.connect(process.env.MONGP_URI)
    .then(()=>{
        console.log("connected to database");
        
    })

}
    module.exports= ConnectToDb
