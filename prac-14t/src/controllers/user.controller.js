
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

async function registerController(req,res){
    const {username, email, password, bio, profileImage} = req.body

    const isAllUserExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAllUserExists){
        return res.status(409).json({
            message:isAllUserExists.email == email ? "email exist already" : "username exist already"
        })
    }

    const hash = await bcrypt.hash(password,10)

    const user = userModel.create({
        username,bio,email,profileImage,password:hash
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
        message:"user registerr successfully",
        user:{
            username:(await user).username,
            email:(await user).email,
            bio:(await user).bio,
            profileImage:(await user).profileImage
        }
    })
}

async function loginController(req,res){
    const{username, email, password}=req.body

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

    const passwordvalid = await bcrypt.compare(password, user.password)

    if(!passwordvalid){
        return res.status(404).json({
            message:"password invalid"
        })
    }

    const token = jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET
    )
    res.cookie("token", token)

    res.status(201).json({
        message:"user LoggedIn",
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





