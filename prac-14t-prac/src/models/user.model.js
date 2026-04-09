const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:[true, "username already exist"],
        required:[true, "username require"]
    },
    email:{
        type:String,
        unique:[true, "email already exists"],
        required:[true, "email require"]
    },
    password:{
        type:String,
        required:[true, "password require"]
    },
    bio:{
        type:String
    },
    profileImage:{
        type:String,
        default:"https://ik.imagekit.io/gdmcmlxtw/9e837528f01cf3f42119c5aeeed1b336.jpg?updatedAt=1770747607441"
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports=userModel