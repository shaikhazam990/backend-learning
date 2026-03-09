
export async function registerUser(req,res,next){
    try {
       throw new Error ("password is too weak "); 
    } catch (error) {
        error.status=409
        next(error)
        
    }
    
    
    
}

export default registerUser