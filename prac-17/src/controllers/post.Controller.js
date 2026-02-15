const postModel = require("../models/post.model")

const ImageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs");
const { Folders } = require("@imagekit/nodejs/resources.js");

const jwt = require("jsonwebtoken");
const { post } = require("../app");

const client = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});


async function createPostController(req,res){
    console.log(req.body, req.file)

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"token invalid"
        })
    }

    let decode;

    try {
        decode=jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message:"unauthorized process"
        })
    }

    console.log(decode)

    const files = await client.files.upload({
  file: await toFile(Buffer.from(req.file.buffer), 'file'),
  fileName: 'test',
  folder: "prac-insta-clone"
});
        // res.send(files)
        const post = await postModel.create({
        caption:req.body.caption,
        imgUrl:files.url,
        user:decode.id
    })

    return res.status(201).json({
        message:"post created successfully",
        post
    })
}

async function getPostController(req,res){

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"unauthorized process"
        })
    }

    let decode;

    try {
        decode= jwt.verify(token , process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message:"invalid token"
        })
    }

    const userId = decode.id

    const post = await postModel.find({
        user:userId
    })

    if(!post){
        return res.status(401).json({
            message:"post not found"
        })
    }

    return res.status(201).json({
        message:"post fetched successfully",
        post
    })


}

async function getpostDetailsController(req,res){
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"unauthorized token"
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
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if(!post){
        return res.status(401).json({
            message:"post not found with this id"
        })
    }

    const isValidUser = post.user.toString() === userId

    if(!isValidUser){
        return res.status(401).json({
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
    getpostDetailsController
}