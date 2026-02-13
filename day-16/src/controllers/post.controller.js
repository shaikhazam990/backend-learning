const postModel = require("../controllers/post.controller")

const ImageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs")

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function CreatePostController(req,res){
    console.log(req.body, req.file)

  const file =  await client.files.upload({
  file: await toFile(Buffer.from(req.file.buffer), 'file'),
  fileName: 'test',
});

    res.send(file)
}

module.exports={
    CreatePostController
}