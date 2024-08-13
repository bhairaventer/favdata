let jwt = require('jsonwebtoken')
require('dotenv').config();

const jwtsecret = process.env.jwtsecret 

let User = require('../module/user')

 



 

 
 
const Fetchuser = async (req, res, next) => {
    const token = req.header('authtoken')// Extract token from 'Authorization' header
    
    if (!token) {
        return res.status(401).send({
            error: "Please authenticate using a valid token"
        });
    }

    try {
        const data = await jwt.verify(token,jwtsecret)
        req.user=data.User    
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                error: "Token has expired",
                success: false
            });
        } else {
            return res.status(401).send({
                error: "Token is invalid",
                success: false
            });
        }
    }
};

module.exports = Fetchuser;





module.exports = Fetchuser


