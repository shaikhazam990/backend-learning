const express = require("express")
const notesModel = require('./models/notes.model')

const app = express()

app.use(express.json())

app.post("/notes", async (req,res)=>{
    const{title,description}=req.body
   const note =  await notesModel.create({
        title,description
    })
    res.status(201).json({
        message:"notes created succesfully",
        note
    })

})

app.get("/notes",async (req,res)=>{
    const notes =await notesModel.find()

    res.status(200).json({
        message:"notes fetched successfully",
        notes
    })
})


module.exports=app