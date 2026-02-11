const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username:{
        type:String,
        unique:[true, "username exists"],
        required:[true," please fill username"]
    },
    password:{
        type:String,
        required:[true, "password require"]
    },
    email:{
        type:String,
        unique:[true, "email exist"],
        required:[true, "email require"]
    },
    bio:{
        type:String,
        required:[true, "bio required"]
    },
    profileImage:{
        type:String,
        default:"https://ik.imagekit.io/gdmcmlxtw/9e837528f01cf3f42119c5aeeed1b336.jpg?updatedAt=1770747607441"
    }

})

const userModel = mongoose.model("user", userSchema)

module.exports=userModel