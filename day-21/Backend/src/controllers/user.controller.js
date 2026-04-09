const followModel = require("../models/follow.model")
const userModel = require("../models/user.model")

async function followUserController(req,res){

    const followerUsername = req.user.username
    const followeeUsername = req.params.username

    if(followeeUsername == followerUsername){
        return res.status(400).json({
            message: " you cannot follow yourself"
        })
    }

    const isfolloweeExists = await  userModel.findOne({
        username: followeeUsername
    })

    if(!isfolloweeExists){
        return res.status(404).json({
            message: " User you are trying to follow does not exists"
        })
    }

    const isAlreadyFollowing = await followModel.findOne({
        follower: followerUsername,
        followee: followeeUsername
    })

    const followRecord = await followModel.create({
        follower: followerUsername,
        followee:followeeUsername
    })

    if(isAlreadyFollowing){
        return res.status(200).json({
            message: `You are already following ${followeeUsername}`,
            follow: isAlreadyFollowing
        })
    }

    res.status(200).json({
        message:`you are now following ${followeeUsername}`,
        follow:followRecord
    })

}

async function unfollowUserController(req,res) {
    const followerUsername = req.user.username

    const follloweeUsername = req.params.username

    const isUserFollowing = await followModel.findOne({
        follower : followerUsername,
        followee: follloweeUsername
    })

    if(!isUserFollowing){
        return res.status(200).json({
            message: `You are not following ${follloweeUsername}`
        })
    }

    await followModel.findByIdAndDelete(isUserFollowing._id)

    res.status(200).json({
        message:` you have unfollowed ${follloweeUsername}`
    })
    
}


module.exports={
    followUserController, unfollowUserController
}