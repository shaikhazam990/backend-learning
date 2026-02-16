const postModel = require("../models/post.model")

const ImageKit = require("@imagekit/nodejs")

const {toFile} = require("@imagekit/nodejs")

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function createPostController(req,res){
    console.log(req.body, req.file)

  const files =   await client.files.upload({
  file: await toFile(Buffer.from(req.file.buffer), 'file'),
  fileName: 'test',
});

        res.send(files)




}

module.exports={
    createPostController
}