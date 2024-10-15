const jwt = require('jsonwebtoken')
const User = require('../schemas/Logschema')
const asynchandler = require('express-async-handler')


const protect = asynchandler(async(req,res,next)=>{
    // console.log(req.headers.authorization);
    let token;
    
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_TOKEN)
            req.user = await User.findById(decoded.id).select("-password")
            next()
        } catch (error) {
            console.error(error)
            res.status(401);throw new Error("Not authorized")
            
        }
        
    }
    if (!token) {
      res.status(401);
      throw new Error("No Token found");
    }
})
module.exports= {protect}