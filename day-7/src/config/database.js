const mongoose = require("mongoose")

function ConnectToDb(){
    mongoose.connect('mongodb+srv://denmoney30_db_user:noVcJV6LylY189LV@cluster0.iazzmoh.mongodb.net/day-7')
    .then(()=>{
        console.log("connected to database");
        
    })

}
    module.exports= ConnectToDb
