const postModel = require("../model/post.models")

const ImageKit = require("@imagekit/nodejs")
const { toFile } = require("@imagekit/nodejs")


const imagekit = new ImageKit({
    privateKey: process.env.IMAGE_PRIVATE_KEY
})


async function createPostController(req,res){
    console.log(req.body, req.file)

    const file = await imagekit.files.upload({
        file: await toFile(Buffer.from(req.file.buffer), 'file'),
        fileName: "Test"
    })

    res.send(file)
}

module.exports={
    createPostController
}
