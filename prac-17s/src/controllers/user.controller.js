const usermodel = require("../models/user.model")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function registerController(req,res){

    const{username, email, bio, profileImage, password} = req.body

    const isAllUserExist = await usermodel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAllUserExist){
        return res.status(401).json({
            message: isAllUserExist.email == email ? "email already exist" : "username already exist"
        })
    }

    const hash = await bcrypt.hash(password,10)

    const user = await usermodel.create({
        username,email,profileImage,bio,password:hash
    })

    if(!user){
        return res.status(401).json({
            message:"user not found"
        })
    }

    const token = jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET
    )
    res.cookie("token", token)

    return res.status(201).json({
        user:{
            username:user.username,
            email:user.email,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })


}

async function loginController(req,res){
    const{username, email, password} = req.body

    const user = await usermodel.findOne({
        $or:[
            {username:username},
            {email:email}
        ]
    })

}

module.exports={
    registerController
}