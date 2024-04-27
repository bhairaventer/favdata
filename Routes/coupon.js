const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const isAdmin = require("../middleware/admin")
const{body,validationResult} = require("express-validator")
const { default: slugify } = require("slugify")

const couponmodule = require("../module/coupon")
const user = require("../module/user")
//fetchallnotes
Router.get ('/fetchallcoupon',middle,isAdmin,async(req,res)=>{
 
    try{
        const coupon = await couponmodule.find({})
        res.json(coupon)
          
    }
    catch(error){
         res.status(500).send("internal error")
    }
})
Router.get ('/fetchadmincoupon',middle,isAdmin,async(req,res)=>{
     try{
        const coupon = await couponmodule.find({user:'admin'})
        res.json(coupon)
        
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})

//single
Router.get ('/fetchcoupon/:id',middle,isAdmin,async(req,res)=>{
    let id = req.params.id
     try{
        const coupon = await couponmodule.findById( id)
        res.json(coupon)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})
//addnotes
 
Router.post("/addcoupon",middle,isAdmin,[
    body("name","enter a valid name").isLength({min:3}),
    // body("expire","enter a valid expire day").isLength({min:1}),
    body("quntity","enter a valid quntity ").isLength({min:1}),
    body("discount","enter a valid discount").isLength({min:1}),
],async(req,res)=>{
   try {
    
       let {name,discount,expire,quntity,user,onlyuser} = req.body
       
       const errors = validationResult(req)
       if(!errors.isEmpty()){
            return res.status(400).json({error : errors.array()})
        }
        const checkcoupon = await couponmodule.findOne({name})
        if(checkcoupon){
            return res.status(200).send({
                success: false,
                message: "coupon Already Exisits",
            });
        }
        const coupon = new couponmodule({
            name,discount,expire,quntity,
            user:user,onlyuser 
        })
        const savecoupon = await coupon.save()
        res.json(savecoupon)
        
    } catch (error) {
        res.status(500).send("internal errror")
    }
})

//update notes
Router.put('/updatecoupon/:id',middle,isAdmin,async(req,res)=>{
    const {name,discount,expire,quntity} = req.body
      const newcoupon ={};
     if(name){newcoupon.name = name}
     if(discount){newcoupon.discount = discount}
     if(expire){newcoupon.expire = expire}
     if(quntity){newcoupon.quntity = quntity}
     let pid = req.params.id
     try { 
     
    
     let coupon = await couponmodule.findById(pid)
      
    if(!coupon){return res.status(404).send("notfound")}
     
   
 
         
          coupon =  await couponmodule.findByIdAndUpdate( 
            pid ,{$set:newcoupon},
                 {new:true}
            ); 
        res.json({coupon})
    } catch (error) { 
     } 
 
 
 
})


Router.delete("/deletecoupon/:id",middle,isAdmin,async(req,res)=>{
 try {
    
     let coupon = await  couponmodule.findById(req.params.id)
     if(!coupon){return res.status(404).send("not found")}
     
     coupon =await couponmodule.findByIdAndDelete(req.params.id)
     res.json({"success":"coupon has been deleted",coupon})
    } catch (error) {
        res.status(500).send("internal errror")
    }
})



//apply coupon

Router.post('/apply-coupon',middle, async (req, res) => {
    
      const { couponCode, totalAmount } = req.body;
 
      // Find the coupon by code
      const coupon = await couponmodule.findOne({ name: couponCode });
      if (!coupon) {
         return res.status(200).json({success:false,discountedAmount:0,finalAmount:0 ,message: 'Enter valid code.'});
      }
      if(coupon){
        const currentDate = new Date();
        const expirationDate = new Date(coupon.expire);
        if (currentDate > expirationDate) {
             return res.status(200).json({success:false,discountedAmount:0,finalAmount:0 , message: 'Coupon has expired.'});
          } else {
           }
          if (coupon.quntity <= 0) {
             return res.status(200).json({ success: false, discountedAmount: 0, finalAmount: 0, message: 'Coupon has finished.' });
        } else {
             // Here you can continue with the logic for a valid coupon
        }
        
      }
  if(coupon.onlyuser ){
   if( coupon.onlyuser.toString()!== req.user.id){
         return res.status(401).send("not allowed")
    }else{
     }
 
  }
    
  
      // Calculate the discounted amount
      const discountedAmount = (coupon.discount / 100) * totalAmount;
      const finalAmount = totalAmount - discountedAmount;
  
      res.json({ success: true, discountedAmount, finalAmount });
 
  });




  Router.put('/use-coupon/:name', async (req, res) => {
    let name = req.params.name
    try {
        let coupon = await  couponmodule.findOne({name})
        await couponmodule.findOneAndUpdate(
            {name} ,
         {quntity: coupon.quntity-1},
         );   
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

//get coupon for all user 
Router.get ('/fetchcouponforall',middle,async(req,res)=>{
   let user = (req.user.id).toString()
    try{
        const coupon = await couponmodule.find({user:'alluser'})
        const usercoupon = await couponmodule.find({onlyuser:user})
        res.json({coupon,usercoupon})
    }
    catch(error){
         res.status(500).send("internal error")
    }
})



Router.put('/sendcoupon/:id', async (req, res) => {
    let id = req.params.id
    let users = req.body.users
    try {
        let coupon = await  couponmodule.findById(id)
        if(!coupon){
            return
        }
        await couponmodule.findByIdAndUpdate(
            id ,
         {onlyuser: users ,user:"user"},
         );   
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
 
module.exports =Router