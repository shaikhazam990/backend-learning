
async function handleError(err,req,res,next) {
    res.status(err.status).json({
        message:err.message
    })
    
}

export default handleError