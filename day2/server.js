const express = require("express")

const app = express()

app.get('/',(req, res)=>{
    res.send("hello world")
})

app.get('/home', function(req,res){
    res.send("welcome to Home")
})
app.listen(3000)