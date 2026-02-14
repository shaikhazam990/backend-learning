const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


async function registerController (req,res){
    const{email, username, password, bio, profileImage} = req.body

    const isAlluserExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAlluserExists){
        return res.status(404).json({
            message:isAlluserExists.email == email ? "email already exists" : "username already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username, email, password:hash
    })

    if(!user){
        return res.status(409).json({
            message:"user not found"
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

    return res.status(201).json({
        message:"user register successfullly",
        user:{
            email:user.email,
            username:user.username,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })
}

async function loginController (req,res){
    const{username, email, password}= req.body

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

    const passwordValid = await bcrypt.compare(password, user.password)

    if(!passwordValid){
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

    return res.status(201).json({
        message:"user LoggedIn successfullyy",
        user:{
            email:user.email,
            username:user.username,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })


}
module.exports={
    registerController,
    loginController
}