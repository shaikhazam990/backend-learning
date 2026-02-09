const express = require("express")

const userModel = require("../models/user.database")
const jwt = require("jsonwebtoken")

const authRouter = express.Router()

const crypto = require("crypto")

authRouter.post("/register", async (req,res)=>{
    const{name,email,password}= req.body

    const isUserExist = await userModel.findOne({email})

    const hash = crypto.createHash('MD5').update(password).digest("hex")

    if(isUserExist){
        return res.status(409).json({
            message:"user already exist with email"
        })
    }

    const user = await userModel.create({
        name,email,password:hash
    })

    const token = jwt.sign(
        {
            id:user._id,
            email:user.email
        },
        process.env.JWT_SECRET

    )
            res.cookie("token_secret", token)


    res.status(201).json({
        message:"user created sucessfully",
        user,
        token
    })
})

authRouter.post("/protected",async(req,res)=>{
    console.log(req.cookies)

    res.status(200).json({
        message:"protected user"
    })
})

authRouter.post("/login", async(req,res)=>{
    const {email,password} = req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(404).json({
            message:"user not found with this email"
        })
    }

    const passwordMatched = user.password === crypto.createHash('MD5').update(password).digest("hex")

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

    res.cookie("token_secret", token)

    res.status(200).json({
        message:"successfully login",
        user
   })
})

module.exports= authRouter