const express = require('express')

const app = express() // server created

app.use(express.json()) // as a middleware

const notes = []

app.get('/notes', (req,res)=>{
    res.send(notes)
    
})

app.post('/notes', (req,res)=>{
    console.log(req.body);
    notes.push(req.body)
    console.log(notes);
    
    
    res.send('note created')
})


app.delete('/notes/:index',(req,res)=>{
    delete notes[req.params.index]
    res.send('notes deleted')
})

app.patch('/notes/:index', (req,res)=>{
    notes[req.params.index].description = req.body.description
    res.send('notes updated successfully')
})

module.exports = app

