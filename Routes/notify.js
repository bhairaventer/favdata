const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const fs = require('fs')
const isAdmin = require("../middleware/admin")

const usermodule = require("../module/user")
const notifymodule = require("../module/notify")
const productmodule = require("../module/product")



Router.post ('/addnotify/:id',middle,isAdmin, async(req,res)=>{
 
 const title = req.body.title
 const orderid = req.body.orderid
 
 let detail = req.body.detail

if (title === 'Processing') {
    detail = "We're excited to inform you that your order is currently being processed at TAVGUN BOUTIQUE. Our dedicated team is working diligently to ensure that everything is prepared and packaged with utmost care.";
} else if (title === 'Shipped') {
    detail = "Exciting news! We're thrilled to inform you that your order has been successfully shipped.";
} else if (title === 'Out for Delivery') {
    detail = "Your package is on its way and should be arriving shortly. Please ensure someone is available at the delivery address to receive the package.";
} else if (title === 'Delivered') {
    detail = "We're thrilled to inform you that your order has been successfully delivered!";
} else if (title === 'Cancelled') {
    detail = "We regret to inform you that your order with TAVGUN BOUTIQUE has been cancelled.";
}
 else if (title === 'Return Approved') {
    detail = "We're writing to inform you that your return request has been successfully approved.";
}
 else if (title === 'Return Rejected') {
    detail = "We regret to inform you that your return request has been rejected. Our team has reviewed the request and determined that it does not meet our return policy criteria.We understand this may be disappointing, and we want to ensure your satisfaction. Our customer support team will contact you shortly to discuss any further assistance you may require.";
}
 else if (title === 'Refund Initiated') {
    detail = "We wanted to inform you that the refund for your order has been initiated.The refund process may take a few business days to complete, depending on your payment method and financial institution. Please be patient as we work to ensure the refund is processed promptly.";
}
 else if (title === 'Return Completed') {
    detail = "We're pleased to inform you that your refund has been successfully processed";
}

    try {
        

const notify1 = await notifymodule.findOne({user:req.params.id , orderid :orderid})


if(notify1){
     try { 
       let order = await notifymodule.findOneAndUpdate({user:req.params.id, orderid :orderid} ,{ title :title,
        detail : detail,read : false,},
            {new:true})
            
            res.json({order})
       
        } catch (error) { 
         } 
 }
 else{

     const cartobh = new notifymodule({
         title :title,
         detail : detail,
         orderid,orderid,
         read : false,
         user : req.params.id,  
        })
                   
        const notifydata = await cartobh.save();
    }
         } catch (error) {
        
        }
        
})


Router.get ('/getnotify',middle,async(req,res)=>{

    try {
        

        const notify = await notifymodule.find({user:req.user.id}).sort({ updatedAt: -1 })
        
        if(!notify){
            return res.status(401).send("you don't have")
        }
        const total = await notifymodule.countDocuments({ read: false ,user:req.user.id});

          res.json({total,notify})
        } catch (error) {
        
        }
              
})

Router.delete ('/deletenotify/:id',middle,async(req,res)=>{
    
       
            
       try {
   
        const notify = await notifymodule.findById(req.params.id)  
         
        if(!notify){return res.status(404).send("not found")}
        if(notify.user.toString()!== req.user.id){
            return res.status(401).send("not allowed")
        }
        let newnotify = await notifymodule.findByIdAndDelete(req.params.id)
        res.json({"success":"notify has been deleted"})
        
    } catch (error) {
        
        res.json({"failed":"note has note been deleted"})
    }
})




Router.put('/readnotify/:id',middle,async(req,res)=>{
   
    const Id = req.params.id
 
      let notify = await notifymodule.findById(Id)
    
    if(!notify){return res.status(404).send("notfound")}
    if(notify.user.toString()!== req.user.id){
        return res.status(401).send("not allowed")
    }
 
    try { 
        notify = await notifymodule.findByIdAndUpdate(Id ,{read:true},
            {new:true})
            
            res.json({notify})
         } catch (error) { 
         } 
        
    
})










module.exports =Router