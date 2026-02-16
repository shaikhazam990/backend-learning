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
            message:"post Created successfully"
        })



        // res.send(files)




}



module.exports={
    createPostController,
    
}