const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    user:String,
    email:{
        type:String,
        unique:[true, "user already exist with account"]
    },
    password:String
})

const userModel = mongoose.model("user", userSchema)

module.exports=userModel