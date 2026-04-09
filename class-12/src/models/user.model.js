const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: String,
    email: {
        type:String,
        unique:[true, "with is email user account already exist"]

    },
    password: String
})

const userModel = mongoose.model("user", userSchema)

module.exports= userModel