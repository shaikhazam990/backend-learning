const postModel = require("../models/post.model")

const ImageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs");
const { Folders } = require("@imagekit/nodejs/resources.js");
// const { json } = require("express");

const jwt = require("jsonwebtoken")

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function CreatePostController(req,res){
    console.log(req.body, req.file)

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"token not provided, unauthorized access"
        })
    }

    let decode;

    try {
        decode = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message:"user not authorized"
        })
        
    }


    console.log(decode)

  const file =  await client.files.upload({
  file: await toFile(Buffer.from(req.file.buffer), 'file'),
  fileName: 'test',
  folder:"cohort-2-insta-clone-posts"
});

    const post = await postModel.create({
        caption:req.body.caption,
        imgUrl: file.url,
        user:decode.id
    })

    res.status(201).json({
        message: "post Created successfully",
        post
    })

    // res.send(file)
}

module.exports={
    CreatePostController
}