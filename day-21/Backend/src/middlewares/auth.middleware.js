    
    const jwt = require("jsonwebtoken");
    async function identifyUser(req,res,next){
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

    req.user= decode

    next()
}

module.exports=identifyUser