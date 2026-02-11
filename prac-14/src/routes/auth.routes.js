const express = require("express")
const userModel = require("../models/user.model")

const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const authRouter = express.Router()

authRouter.post("/register", (req,res)=>{
    const{username, email, password, bio, profileImage}= req.body

    const isUserExist = userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    })

    if(!isUserExist){
        return res.status(409).json({
            message:"user already exist" + (isUserExist.email==email ? "email already exist" : "user already exists")

        })
    }
    const hash = crypto.createHash("sha256").update(password).digest("hex")


    

    const user = userModel.create({
        username,email,bio,profileImage,password:hash
    })

    res.status(201).json({
        message:"user LoggedIn",
        user
    })
})