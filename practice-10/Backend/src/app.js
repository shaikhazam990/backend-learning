const express = require("express")
const noteModel = require("./models/note.model")
const cors = require("cors")
const path = require("path")


const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static("./public"))

app.post("/notes/prt", async (req,res)=>{
    const{title, description}= req.body

    const notes = await noteModel.create({
        title,
        description
    })
    res.status(201).json({
        message:"notes created successfully",
        notes
    })
})

app.get("/notes/prt", async (req,res)=>{
    const notes = await noteModel.find()

    res.status(200).json({
        message:"fetched notes successfully",
        notes
    })
})

app.delete("/notes/prt/:id", async (req,res)=>{
    const id = req.params.id
    await noteModel.findByIdAndDelete(id)

    res.status(204).json({
        message:"notes deleted successfully"
    })
})

app.patch("/notes/prt/:id", async (req,res)=>{
    const id = req.params.id
    const {description} = req.body
    await noteModel.findByIdAndUpdate(id, {description})

    res.status(200).json({
        message:"notes update successfully"
    })
})

app.use("*name",(req,res)=>{
    res.sendFile(this.path.join(__dirname, "..", "./public/index.html"))
})




module.exports=app