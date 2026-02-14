const postModel = require("../models/post.model")

const imageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs")

const client = new imageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});


async function CreatePostController(req,res){

    console.log(req.body, req.file)

    const files =  await client.files.upload({
  file: await toFile(Buffer.from(req.file.buffer), 'file'),
  fileName: 'test',
});

res.send(files)

}

module.exports= {
    CreatePostController
}