const express = require('express')
const ConnextedToDb = require('./config/database')
const noteModel = require('./Models/notes.model')
const { mongo, default: mongoose } = require('mongoose')


const app = express()
app.use(express.json())

app.post('/notes', async (req,res)=>{
    const{title,description}=req.body

    const note = await noteModel.create({
        title,description
    })

    res.status(201).json({
        message:"notes create successfullly",
        note
    })
})

app.get("/notes",async (req,res)=>{
    const notes = await noteModel.find()

    res.status(200).json({
        message:"fetch notes successfully",
        notes
    })
})

ConnextedToDb()

module.exports=app