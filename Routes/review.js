const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const fs = require('fs')
const usermodule = require("../module/user")
const cartmodule = require("../module/cart")
const productmodule = require("../module/product")
const Review = require("../module/Review")
const formidable = require("express-formidable")




Router.get('/getreview/:producatname/:page', async (req, res) => {
    let  producatname =req.params.producatname
   
    const perPage = 10;
    const page = req.params.page ? parseInt(req.params.page) : 1
 
       const reviews = await Review.find({product:producatname}).sort({ createdAt: -1 }).select("-photo0").select("-photo1").select("-photo2").select("-photo3").populate({
        path: 'user',
        model: 'user',
        select: 'name'
    }).skip((page - 1) * perPage)
    .limit(perPage)

    try {
      const reviews22 = await Review.find({product:producatname}).select("rating").select("comment")
      const Total =  reviews22.length
   
        let value = 0
       let totalrating = 0
       let totalreview = 0
       let rat5 = 0
       let rat2 = 0
       let rat1 = 0
       let rat3 = 0
       let rat4 = 0

       reviews22.forEach(element => {
         if(element.rating==5){
            rat5 += 1
            
         }
         if(element.rating==4){
            rat4 += 1
            
         }
         if(element.rating==3){
            rat3 += 1
           
         }
         if(element.rating==2){
            rat2 += 1
            
         }
         if(element.rating==1){
            rat1 += 1
           
         }
      
          
       
         if(element.comment){
          totalreview += 1
         }

         if(element.rating){
          totalrating += 1
         }
              
         value += element.rating
         });
         let allrating = {rat1,rat2,rat3,rat4,rat5}

         await productmodule.updateMany(
          { name :producatname  },
        { $set: { review:{reviews : value/Total , totalrating} } },
        );
       res.json({reviews,Total,value,allrating,totalreview,totalrating});
      } catch (error) {
      
      }
 });



 Router.post('/addreview',middle,formidable(), async (req, res) => {
    let {product ,rating,comment,orderid,name,id}=  req.fields;

 
    if(rating == 0){
      rating = 1
    }
try {
  

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
    const reviews = await Review.findOne({user:req.user.id, orderid:orderid,id:id });
     
    if(reviews){
        return res.status(200).json({ message:"You have already reviewed",success: false });
    }
    const review = new Review({
       product: product,
       user:req.user.id,
       id :id,
       rating: rating,
       orderid:orderid,
       name:name,
       comment: comment,
    });

    if (photo0) {
      review.photo0.data = fs.readFileSync(photo0.path);
      review.photo0.contentType = photo0.type;
    }
  if (photo1) {
   review.photo1.data = fs.readFileSync(photo1.path);
   review.photo1.contentType = photo1.type;
    }
  if (photo2) {
   review.photo2.data = fs.readFileSync(photo2.path);
   review.photo2.contentType = photo2.type;
    }
  if (photo3) {
   review.photo3.data = fs.readFileSync(photo3.path);
   review.photo3.contentType = photo3.type;
    }
 
    try {
       const newReview = await review.save();


      

       res.status(201).json(newReview);
    } catch (error) {
       res.status(400).json({ message: error.message });
    }
  } catch (error) {
  
  }
  
 });


 


Router.get("/getreviewphoto1/:id",async(req,res)=>{
   try {
     const review = await Review.findById(req.params.id).select("photo0") 
     if (review.photo0.data ) {
       res.set("Content-type", review.photo0.contentType);
       return res.status(200).send(review.photo0.data );
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })

Router.get("/getreviewphoto2/:id",async(req,res)=>{
   try {
     const review = await Review.findById(req.params.id).select("photo1") 
     if (review.photo1.data ) {
       res.set("Content-type", review.photo1.contentType);
       return res.status(200).send(review.photo1.data );
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })

Router.get("/getreviewphoto3/:id",async(req,res)=>{
   try {
     const review = await Review.findById(req.params.id).select("photo2") 
     if (review.photo2.data ) {
       res.set("Content-type", review.photo2.contentType);
       return res.status(200).send(review.photo2.data );
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })
Router.get("/getreviewphoto4/:id",async(req,res)=>{
   try {
     const review = await Review.findById(req.params.id).select("photo3") 
     if (review.photo3.data ) {
       res.set("Content-type", review.photo3.contentType);
       return res.status(200).send(review.photo3.data );
     }
     
   } catch (error) {
     res.status(500).send({
       success: false,
       message: "Erorr while getting photo",
       
     });
   }
 })

module.exports =Router