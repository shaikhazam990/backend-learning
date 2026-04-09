const postModel = require("../models/post.model")

const imageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs")

const jwt = require("jsonwebtoken")

const client = new imageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});


async function CreatePostController(req,res){

    console.log(req.body, req.file)

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"token invalid , unauthorized process"
        })
    }

    let decode;

    try {
        decode = await jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        res.status(401).json({
            message:"user not authorized"
        })
        
    }

    console.log(decode)

    const file =  await client.files.upload({
  file: await toFile(Buffer.from(req.file.buffer), 'file'),
  fileName: 'test',
  folder:"prac-insta-clone"
});

            const post = await postModel.create({
            caption:req.body.caption,
            imgUrl:file.url,
            user:decode.id
        })

        res.status(201).json({
            message:"post create successfully",
            post
        })

}

module.exports= {
    CreatePostController
}