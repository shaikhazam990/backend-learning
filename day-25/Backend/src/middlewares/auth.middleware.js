const blacklistModel = require("../model/blacklist.model")
const userModel = require("../model/user.model")
const jwt = require("jsonwebtoken")

async function authUser(req,res,next) {
    const token = req.cookie.token

    if(!token){
        return res.status(401).json({
            message:"token not provided"
        })
    }

    const istokenBlacklisted = await blacklistModel.findOne({
        token
    })

    if(istokenBlacklisted){
        return res.status(401).json({
            message:"invalid token"
        })
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user=decode
        next()
    } catch (error) {
        return res.status(401).json({
            message:"invalid token"
        })   
    }
}

module.exports={
    authUser
}

