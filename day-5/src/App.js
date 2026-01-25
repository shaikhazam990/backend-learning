// used to create server

const { log } = require('console')
const express = require('express')

const app = express()
app.use(express.json())

const notes = []

// create notes
app.post('/notes', (req,res)=>{
    console.log(req.body)
    notes.push(req.body)
    res.status(201).json({
    message: "notes created successfully"        
    })
})

// fetch notes

app.get('/notes', (req,res)=>{
    res.status(200).json({
        notes:notes
    })
})

// delete note
// in status 204 no message showed plz keep in mind
app.delete('/notes/:index', (req,res)=>{
    delete notes[req.params.index]
    res.status(204).json({
        message:"notes deleted successfully"
    })
})

//PATCH NOTES : PARTIALLY UPDATE NOTES
app.patch('/notes/:index', (req,res)=>{
    notes[req.params.index].description = req.body.description
    res.status(200).json({
        message:"notes updated successfully"
    })
})

module.exports=app;
