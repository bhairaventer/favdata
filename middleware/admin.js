 
const User = require('../module/user')
 

const isAdmin = async(req,res,next)=>{
 
   
    try {
      let iid = await req.user.id
      const user = await User.findById(iid).select("-password")
     
     
 
 
    if(user.role !== 1){
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",})
    }else{next()}
  } catch (error) {
     res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
}
module.exports = isAdmin
