const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema({
    title:String,
    description:String
})

const notesModels=mongoose.model("notes", noteSchema)

module.exports=notesModels