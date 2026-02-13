const postModel = require("../models/post.model")
const ImageKit = require("@imagekit/nodejs")
const { toFile } = require("@imagekit/nodejs")
const { Folders } = require("@imagekit/nodejs/resources.js")

const jwt = require("jsonwebtoken")



const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})


async function createPostController(req, res) {
    console.log(req.body, req.file)

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"user unauthorized found"
        })
    }

    let decode;

    try {
        decode = jwt.verify(token, process.env.JWT_SECRET)
        
    } catch (error) {
        return res.status(401).json({
            message:"unauthorized user"
        })
        
    } 

    console.log(decode)

    



    const file = await imagekit.files.upload({
        file: await toFile(Buffer.from(req.file.buffer), 'file'),
        fileName: "Test",
        folder: "cohort-2-insta-clone"
    })

    // res.send(file)

    const post = await postModel.create({
        caption:req.body.caption,
        imgurl:file.url,
        user:decode.id
    })

    res.status(201).json({
        message:"post created succesfully",
        post
    })



}

module.exports = {
    createPostController
}