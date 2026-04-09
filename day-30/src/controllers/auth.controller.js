
export async function registerUser(req,res,next){
    res.status(201).json({
        message:"user registered successfully"
    })

}
    
    
    

export default registerUser