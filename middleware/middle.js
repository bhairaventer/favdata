let jwt = require('jsonwebtoken')
require('dotenv').config();

const jwtsecret = process.env.jwtsecret 

let User = require('../module/user')

const Fetchuser = async(req,res,next)=>{
    const token = req.header('authtoken')
 
    if(!token){
        res.status(402).send({
            error:"please authenticate using a valid token"
        })
    }
    try{
        const data = await jwt.verify(token,jwtsecret)
        req.user=data.User    
        next()
    }
    catch(error){
        res.status(401).send("error..")
    }
}
module.exports = Fetchuser
