const userModel = require("../models/user.model")

const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

async function registerController(req,res){
    const{username, email, password, bio, profileImage} = req.body

    const isAllUserExist = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAllUserExist){
        return res.status(409).json({
            message: isAllUserExist.email == email ? "email already exist" : "username already exists"
        })
    }

    const hash= await bcrypt.hash(password,10)

    const user = await userModel.create({
        username, bio, profileImage, email, password:hash
    })

    const token = jwt.sign(
        {
            id:user._id,
            username:user.username

        },
        process.env.JWT_SECRET
    )
    res.cookie("token", token)

    res.status(201).json({
        message:"user register successfully",
        user:{
            email:user.email,
            username:user.username,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })
}

async function loginController(req,res){
    const {email, password, username} = req.body

    const user = await userModel.findOne({
        $or:[
            {username:username},
            {email:email}
        ]
    }).select("+password")

    if(!user){
        return res.status(409).json({
            message:"user not found"
        })
    }

    const passwordValid = await bcrypt.compare(password, user.password)

    if(!passwordValid){
        return res.status(409).json({
            message:"your password is incorrect"
        })
    }

    const token = jwt.sign(
        {
            id:user._id,
            username:user.username
        },
        process.env.JWT_SECRET
    )
    res.cookie("token", token)

    res.status(201).json({
        message:"User LOggedIn",
        user:{
            username:user.username,
            email:user.email,
            bio:user.bio,
            profile:user.profileImage
        }

    })

}

async function getMeController(req, res) {
    const userId = req.user.id

    const user = await userModel.findById(userId)

    res.status(200).json({
        user: {
            username: user.username,
            email: user.email,
            bio: user.bio,
            profileImage: user.profileImage
        }
    })
}

module.exports ={
    registerController,
    loginController,
    getMeController
}