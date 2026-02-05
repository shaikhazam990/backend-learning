const mongoose = require("mongoose")

const noteSchema = mongoose.Schema({
    title:String,
    description:String,
    image:String
})

const noteModel = mongoose.model("notes", noteSchema)

module.exports=noteModel

