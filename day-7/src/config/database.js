const mongoose = require("mongoose")

const url = process.env.MONG0_URI;

function connectToDb (){
    mongoose.connect(url)
    .then(()=>{
        console.log("connected to database");
        
    })
}

module.exports=connectToDb