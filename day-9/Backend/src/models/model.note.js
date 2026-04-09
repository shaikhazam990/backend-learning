const mongoose = require("mongoose")


const noteSchema = new mongoose.Schema({
    title:String,
    description:String
})

const notemodels = mongoose.model("notes",noteSchema )

module.exports=notemodels
