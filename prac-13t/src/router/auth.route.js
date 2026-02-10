const express = require("express")

const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

const crypto = require("crypto")

const authRouter = express.Router()

authRouter.post("/register", async (req,res)=>{
    const{name,email,password}= req.body

    const isUserExist = await userModel.findOne({email})

    const hash = crypto.createHash("MD5").update(password).digest("hex")

    if(isUserExist){
        return res.status(404).json({
            message:"with this email user already exist"
        })
    }

    const user = await userModel.create({
        name,email,password:hash
    })

    const token= jwt.sign(
        {
            id:user._id,
            email: user.email
        },

        process.env.JWT_SECRET

    )

    res.cookie("token_jwt", token)

    res.status(201).json({
        message:"user created successfully",
        user,
        token
    })


})

authRouter.post("/protected", (req,res)=>{
    console.log(req.cookies)

    res.status(200).json({
        message:"user protected"
    })
})

authRouter.post("/login", async (req,res)=>{
    const{email, password}= req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(404).json({
            message:"user does not exist with this email"
        })
    }

    const passwordMatched = user.password === crypto.createHash("MD5").update(password).digest("hex")

    if(!passwordMatched){
        return res.status(401).json({
            message:"Invalid Password"
        })
    }

    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET
    )
    res.cookie("token_jwt", token)

    res.status(200).json({
        message:"logged in"
    })


})

module.exports=authRouter