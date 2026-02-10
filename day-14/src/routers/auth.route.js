const express = require("express")
const userModel = require("../models/user.model")
const crypto = require("crypto")

const jwt = require("jsonwebtoken")

const authRouter = express.Router()

authRouter.post("/register", async(req,res)=>{
    const{username, email, password, bio, profileImage} = req.body

    const isuserAlreadyExist = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isuserAlreadyExist){
        return res.status(409).json({
            message:"user already exist" + (isuserAlreadyExist.email == email ? "email already exist" : "username already exists")

        })
    }

    const hash = crypto.createHash('sha256').update(password).digest("hex")

    const user = await userModel.create({
        username,
        email,
        profileImage,
        bio,
        password:hash
    })
    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET,
        {expiresIn: "3d"}
        
    )
    res.cookie("token", token)

    res.status(201).json({
        message:"user created successfully",
        user:{
            email:user.email,
            username:user.username,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })

})

module.exports= authRouter