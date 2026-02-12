const mongoose = require("mongoose")


const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        default:''
    },
    imageURl:{
        type:String,
        required:[true, "imageurl require"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        require:[true, "user id require"]
    }
})


const postModel = mongoose.model("post", postSchema)

module.exports=postModel