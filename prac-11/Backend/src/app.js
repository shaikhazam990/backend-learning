const express = require("express")
const noteModel = require("./models/notes.model")
const cors = require("cors")
const path = require("path")

const app = express()
app.use(express.json())
app.use(express.static('./public'))
app.use(cors())


app.post("/demo/note/", async (req,res)=>{
    const{title,description,image}= req.body

    const notes = await noteModel.create([{
        title,
        description,
        image
    }])

    res.status(201).json({
        message:"notes created successfully",
        notes
    })
})

app.get("/demo/note",async (req,res)=>{
    const notes = await noteModel.find()

    res.status(200).json({
        message:"fetched notes succesffully",
        notes
    })
})

app.delete("/demo/note/:id", async (req,res)=>{
    const id = req.params.id
    await noteModel.findByIdAndDelete(id)

    res.status(200).json({
        message:"notes delete successfully"
    })
})

app.patch("/demo/note/:id", async (req,res)=>{
    const id = req.params.id
    const {description} = req.body

    await noteModel.findByIdAndUpdate(id, {description})

    res.status(200).json({
        message:"notes updated successfully"
    })
})

app.use("*name", (req,res)=>{
    res.sendFile(path.join(__dirname, "..", './public/index.html'))
})
module.exports=app;