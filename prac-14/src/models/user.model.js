const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username:{
        type:String,
        unique:[true, " username already exists"],
        required:[true, "please fill username"]
    },
    email:{
        type:String,
        unique:[true, " email already exists"],
        required:[true, "please fill email"]
    },
    password:{
        type:String,
        require:[true, ""]
    },
    bio:String,
    profileImage:{
        type:String,
        default:" https://ik.imagekit.io/gdmcmlxtw/9e837528f01cf3f42119c5aeeed1b336.jpg?updatedAt=1770747607441"
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel