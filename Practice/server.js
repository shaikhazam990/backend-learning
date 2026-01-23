const express = require("express")

const app = express()

app.use(express.json())

const notes = []

app.post('/notes', (req,res)=>{
    res.send('notes created')
    console.log(req.body);
    notes.push(req.body)
})

app.get('/notes', (req,res)=>{
    res.send(notes)
})

app.listen(8000, ()=>{
    console.log("server executed");
    
})