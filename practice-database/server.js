//  to start server
// connect to database

const { default: mongoose } = require('mongoose');
const app =require('./src/app')

function ConnectToDb(){
    mongoose.connect("mongodb+srv://azam:Azam123@cluster0.mdp83mr.mongodb.net/")
    .then(()=>{
        console.log("Database connected to server")
    })
}

ConnectToDb()

app.listen(3000,()=>{
    console.log("server is running on port 3000");
    
})