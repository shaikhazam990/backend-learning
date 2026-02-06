const express = require("express")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")


const authRouter = express.Router()

authRouter.post("/register", async (req,res)=>{
    const{name,email,password}=req.body

    const isuseralreadyexist = await userModel.findOne({email})
    if(isuseralreadyexist){
        return res.status(409).json({
            message:"with this email user account already exist"
        })
    }

   const user = await userModel.create({
        email,password,name
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

module.exports= authRouter