const express = require('express')

const notemodels = require('./models/model.note')

const app = express()
app.use(express.json())

app.post("/api/notes", async (req,res)=>{
    const{title, description}= req.body
    const notes = await notemodels.create({
        title,description
    })

    res.status(201).json({
        message: "notes created successfully",
        notes
    })
})

app.get("/api/notes", async (req,res)=>{
    const note = await notemodels.find()

    res.status(200).json({
        message:"fetched note successfully",
        note
    })
})

app.delete("/api/notes/:id", async (req,res)=>{
    const id = req.params.id

    await notemodels.findByIdAndDelete(id)

    res.status(200).json({
        message:"notes deleted successfully"
    })
    
})

app.patch("/api/notes/:id", async (req,res)=>{
    const id = req.params.id
    const {description} = req.body

    await notemodels.findByIdAndUpdate(id , {description})

    res.status(200).json({
        message:"notes updated successfully"
    })
})

module.exports=app