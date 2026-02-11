
const userModel = require("../models/user.model")
// const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")



async function registerController (req,res){
    const{username, email, password, bio, profileImage} = req.body

    const isAllUserExist =await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAllUserExist){
        return res.status(409).json({
            message: isAllUserExist.email == email ? "email already exist" : "username already exist"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,email, bio, profileImage, password:hash
    })

    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.MONGO_URI,
        {expiresIn: "1d"}

    )
    res.cookie("token", token)

    res.status(201).json({
        message:"user registered successfully",
        user:{
            email:user.email,
            username:user.username,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })
}

async function loginController (req,res){
    const{username, email, password} = req.body

    const user = await userModel.findOne({
        $or:[
            {username:username},
            {email:email}
        ]
    })
    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
        return res.status(404).json({
            message:"password invalid"
        })
    }
    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )
    res.cookie("token", token)

    res.status(201).json({
        message:"user LoggedIn successfully",
        user:{
            username:user.username,
            email:user.email,
            bio:user.bio,
            profile:user.profileImage

        }
    })
}

module.exports={
    registerController,
    loginController
}