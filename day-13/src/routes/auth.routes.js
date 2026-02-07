const express = require("express")

const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

const authRouter = express.Router()

authRouter.post("/register", async (req,res)=>{
    const{name ,email,password}= req.body

    const userAlreadyExist = await userModel.findOne({email})

    if(userAlreadyExist){
        return res.status(409).json({
            message:"with this email user already exist"
        })
    }


    const user =await userModel.create([{
        name,email,password
    }])

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

module.exports=authRouter