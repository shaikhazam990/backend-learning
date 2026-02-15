const userModel = require("../models/user.model")

const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


async function registerController(req,res){
    const{username, email, password, bio, profileImage} = req.body

    const isAlluserExist = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAlluserExist){
        return res.status(404).json({
            message:isAlluserExist.email==email ? "email already exists" : "username already exist"
        })
    }

    const hash = await bcrypt.hash(password, 10)


    const user = await userModel.create({
        username, email, bio, profileImage, password:hash
    })

    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET
    )
    res.cookie("token", token)

    return res.status(201).json({
        message:"User registered successfully",
        user:{
            username:user.username,
            bio:user.bio,
            profileImage:user.profileImage,
            email:user.email
        }
    })

}

async function loginController(req,res){
    const{username, email, password} = req.body

    const user = await userModel.findOne({
        $or:[
            {username:username},
            {email:email}
        ]
    })

    if(!user){
        return res.status(409).json({
            message:"user not foundd"
        })
    }

    const passwordValid = await bcrypt.compare(password, user.password)
    if(!passwordValid){
        return res.status(409).json({
            message:"password inValid"
        })
    }

    const token = jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET
    )
    res.cookie("token", token)

    return res.status(201).json({
        message:"user loggedIn successfully",
        user:{
            username:user.username,
            email:user.email,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })

}

module.exports={
    registerController,
    loginController
}