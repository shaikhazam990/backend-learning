const followModel = require("../models/follow.model")
const userModel = require("../models/user.model")

async function followUserController(req,res){
    const followerUsername = req.user.username
    const followeeUsername = req.params.username

    if(followeeUsername == followerUsername){
        return res.status(404).json({
            message:"you cannot follow yourself"
        })
    }

    const userAlreadyExists = await userModel.findOne({
        username:followeeUsername

    })
    
    if(!userAlreadyExists){
        return res.status(400).json({
            message:"user you are follow does not exists"
        })
    }

    const followRecord = await followModel.create({
        follower: followerUsername,
        followee: followeeUsername
    })

    return res.status(201).json({
        message: `you are following ${followeeUsername}`,
        follow: followRecord

    })




}

module.exports= {
    followUserController
}
