const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const fs = require('fs')
const usermodule = require("../module/user")
const cartmodule = require("../module/cart")
const ordermodule = require("../module/order")
const Return = require("../module/return")
const isAdmin = require("../middleware/admin")
const formidable = require("express-formidable")

 



Router.get('/getreturn/:orderid',middle,isAdmin, async (req, res) => {
    let  id =req.params.orderid
    try {
      
  
    const returns = await Return.find({orderid:id}).sort({ createdAt: -1 }).select("-photo0").select("-photo1").select("-photo2").select("-photo3").populate({
      path: 'user',
      model: 'user',
      select: '-password'
  })
        res.json(returns);
      } catch (error) {
      
      }
    
 });



 Router.post('/addreturns',middle,formidable(), async (req, res) => {
    const {problem,issue,orderid} =  req.fields;
    const {photo0,photo1,photo2,photo3} =req.files
    switch (true){ 
      case photo0 && photo0.size > 1000000:
         return res
           .status(500)
           .send({ error: "photo is Required and should be less then 1mb" });
       case photo1 && photo1.size > 1000000:
         return res
           .status(500)
           .send({ error: "photos is Required and should be less then 1mb" });
       case photo2 && photo2.size > 1000000:
         return res
           .status(500)
           .send({ error: "photos is Required and should be less then 1mb" });
       case photo3 && photo3.size > 1000000:
         return res
           .status(500)
           .send({ error: "photos is Required and should be less then 1mb" });
         }
    const newinfo = "Return Requested"
   //  const returns = await Return.findOne({user:req.user.id, orderid:orderid});
     
    // if(returns){
    //     return res.status(200).json({ message:"already returned",success: false });
    // }
    const return1 = new Return({
         problem,issue,orderid, user:req.user.id,
    });

    if (photo0) {
      return1.photo0.data = fs.readFileSync(photo0.path);
      return1.photo0.contentType = photo0.type;
    }
  if (photo1) {
   return1.photo1.data = fs.readFileSync(photo1.path);
   return1.photo1.contentType = photo1.type;
    }
  if (photo2) {
   return1.photo2.data = fs.readFileSync(photo2.path);
   return1.photo2.contentType = photo2.type;
    }
  if (photo3) {
   return1.photo3.data = fs.readFileSync(photo3.path);
   return1.photo3.contentType = photo3.type;
    }
 
   
    try {
       const newreturn1 = await return1.save();
       let order = await ordermodule.findById(orderid)
     order = await ordermodule.findByIdAndUpdate(orderid,{status:newinfo},
        {new:true})
        
       res.status(201).json({newreturn1});
    } catch (error) {
       res.status(400).json({ message: error.message });
    }
 });





 Router.get("/getreturnphoto1/:id",async(req,res)=>{
   try {
     const return1 = await Return.findById(req.params.id).select("photo0") 
     if (return1.photo0.data ) {
       res.set("Content-type", return1.photo0.contentType);
       return res.status(200).send(return1.photo0.data);
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })


Router.get("/getreturnphoto2/:id",async(req,res)=>{
   try {
     const return1 = await Return.findById(req.params.id).select("photo1") 
     if (return1.photo1.data ) {
       res.set("Content-type", return1.photo1.contentType);
       return res.status(200).send(return1.photo1.data );
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })

Router.get("/getreturnphoto3/:id",async(req,res)=>{
   try {
     const return1 = await Return.findById(req.params.id).select("photo2") 
     if (return1.photo2.data ) {
       res.set("Content-type", return1.photo2.contentType);
       return res.status(200).send(return1.photo2.data );
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })
 
Router.get("/getreturnphoto4/:id",async(req,res)=>{
   try {
     const return1 = await Return.findById(req.params.id).select("photo3") 
     if (return1.photo3.data ) {
       res.set("Content-type", return1.photo3.contentType);
       return res.status(200).send(return1.photo3.data );
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })

module.exports =Router