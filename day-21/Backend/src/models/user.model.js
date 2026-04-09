const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:[true, "username already exist "],
        required:[true, "username is required"]
    },
    email:{
        type:String,
        unique:[true, "email already exists"],
        required:[true, "email is required"]
    },
    password:{
        type:String,
        required:[true, "password is required"],
        select:false

    },
    bio:String,
    profileImage:{
        type:String,
        default:"https://ik.imagekit.io/gdmcmlxtw/9e837528f01cf3f42119c5aeeed1b336.jpg"
    },

    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]
})

const userModel = mongoose.model("user", userSchema)

module.exports=userModel
