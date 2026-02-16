const postModel = require("../models/post.model")

const ImageKit = require("@imagekit/nodejs")

const {toFile} = require("@imagekit/nodejs")

const jwt = require("jsonwebtoken")

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function createPostController(req,res){
    console.log(req.body, req.file)

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"invalid token"
        })
    }

    let decode;

    try {
        decode=jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {

        return res.status(409).json({
            message:"unauthorized process"
        }) 
    }
    console.log(decode)

  const files =   await client.files.upload({
  file: await toFile(Buffer.from(req.file.buffer), 'file'),
  fileName: 'test',
  folder: "prac-insta-clone",
});

        const post = await postModel.create({
            caption:req.body.caption,
            imgUrl:files.url,
            user:decode.id
        })

        return res.status(201).json({
            message:"post Created successfully",
            post
        })



        // res.send(files)




}

async function getPostController (req,res){
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"Unauthorized process"
        })
    }
    let decode;

    try {
        decode=jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message:"invalid token"
        })
    }

    const userId = decode.id

    const post = await postModel.find({
        user:userId
    })

    return res.status(201).json({
        message:"post fetched successfully",
        post
    })

}

async function getPostDetailController(req,res){

    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message:"unauthorized token"
        })
    }

    let decode;

    try {
        decode= jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message:"invalid token"
        })
    }

    const userId = decode.id
    const postId = req.params.postId

    const post = await postModel.findById(postId)
    if(!post){
        return res.status(401).json({
            message:"post not found with this id"
        })
    }

    const IsvalidUser = post.user.toString() == userId

    if(!IsvalidUser){
        return res.status(403).json({
            message:"forbidden content"
        })
    }

    return res.status(200).json({
        message:"post fetched successfully"
    })
}

module.exports={
    createPostController,
    getPostController,
    getPostDetailController
    
}