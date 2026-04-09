const express = require("express")
const noteModel = require('./models/note.model')
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

app.post("/practice/notes", async (req,res)=>{
    const{title, description}=req.body

    const notes = await noteModel.create([{
        title,
        description
    }])

    res.status(201).json({
        message:"notes created successfully",
        notes
        
    })
})

app.get("/practice/notes", async (req,res)=>{
   const note = await noteModel.find() 

    res.status(200).json({
        message:"fetched notes successfully",
        note
    })
})


app.delete("/practice/notes/:id", async (req,res)=>{
    const id = req.params.id    
   await noteModel.findByIdAndDelete(id)

    res.status(204).json({
        message:"notes deleted successfully"
    })
})


app.patch("/practice/notes/:id", async (req,res)=>{
    const id = req.params.id
    const {description} = req.body

   await noteModel.findByIdAndUpdate(id, {description})

    res.status(200).json({
        message:"notes updated successsfully"
    })
})
module.exports=app