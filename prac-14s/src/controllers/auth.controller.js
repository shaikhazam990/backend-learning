const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")


async function registerController (req,res){
    const {username , email, password, bio, profileImage} = req.body

    const isAllUserExist = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAllUserExist){
        return res.status(409).json({
            message: isAllUserExist.email===email ? "email already exist" : "username already exist"
        })

    }

    const hash = crypto.createHash("sha256").update(password).digest("hex")

    const user = await userModel.create({
        username,email,bio,profileImage,password:hash
    })

    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )
    res.cookie("token", token)

    res.status(201).json({
        message:"user created successfully",
        user:{
            username:user.username,
            email:user.email,
            password:user.password,
            bio:user.bio,
            profileImage:user.profileImage
        },
        token
    })


}

async function loginController (req,res){
    const{email, password, username} = req.body

    const user = await userModel.findOne({
        $or:[
            {
                username:username
            },
            {
                email:email
            }
        ]
    })

    if(!user){
        return res.status(409).json({
            message: "user not found"
        })
    }

    const hash = crypto.createHash("sha256").update(password).digest("hex")

    const passwordMatched = user.password == hash

    if(!passwordMatched){
        return res.status(409).json({
            message:"invalid password",
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
        message:"user LoggedIn"
    })
}

module.exports = {
    registerController,
    loginController
}