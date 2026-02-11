const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        default:""
    },
    imgurl:{
        type:String,
        required:[true, "imageurl require"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:[true, "users require"]
    }
})
 const postModel = mongoose.model("post", postSchema)

module.exports= postModel