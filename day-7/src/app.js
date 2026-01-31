// to create server 
// to config server

const express = require("express")

const models = require('./model/model.notes')

const app =express()

app.use(express.json())


app.post("/notes", async(req,res)=>{
    const {title , description}=req.body
    const notes = await models.create({
        title,description
    })

    res.status(201).json({
        message:"notes created successfully",
        notes
    })
})

app.get("/notes", async(req,res)=>{
    const note = await models.find()

    res.status(200).json({
        message:"notes fetch successfully",
        note
    })
})

module.exports=app