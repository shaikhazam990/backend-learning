const express = require("express")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.database")
const authRouter = express.Router()

authRouter.post("/register", async (req,res)=>{
    const{name,email,password}= req.body

    const isUserAlreadyExist =  await userModel.findOne({email})

    if(isUserAlreadyExist){
        return res.status(409).json({
            message:"user already exist with this email"
        })
    }

    const user = await userModel.create({
        name,email,password
    })

    const token = jwt.sign(
        {
            id:user._id,
            email:user.email
        },
        process.env.JWT_SECRET
    )
    res.cookie("jwt_token", token)

    res.status(201).json({
        message:"user created successfully",
        user,
        token
    })
})

authRouter.post("/protected", async(req,res)=>{
    console.log(req.cookies)

    res.status(200).json({
        message:"protected user"
    })
})

authRouter.post("/login", async (req,res)=>{
    const{email, password}= req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(404).json({
            message:"user not found with this email"
        })
    }

    const passwordMatched = user.password=== password

    if(!passwordMatched){
        return res.status(404).json({
            message:"invalid password"
        })
    }

    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET
    )
    res.cookie("jwt_token", token)
    res.status(200).json({
    message:"user logged in",
    user
})


})



module.exports=authRouter