const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const{body,validationResult} = require("express-validator")
const catogarymodule = require("../module/catogary")
const { default: slugify } = require("slugify")
const isAdmin = require("../middleware/admin")
const formidable = require("express-formidable")
const fs = require("fs")
//fetchallnotes
Router.get ('/fetchallcatogary',async(req,res)=>{
    try{
        const catogary = await catogarymodule.find({}).select("-photo")
        res.json(catogary)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})

//single
Router.get ('/fetchcatogary/:id',async(req,res)=>{
    let id = req.params.id
     try{
        const catogary = await catogarymodule.findById( id).select("-photo")
        res.json(catogary)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})
//single img get
Router.get (`/fetchcatogaryimg11/:id`,async(req,res)=>{
    let id = req.params.id
     try{
        const catogary = await catogarymodule.findById( id).select("categoryphoto")
        if (catogary.categoryphoto.data ) {
            res.set("Content-type", catogary.categoryphoto.contentType);
            return res.status(200).send(catogary.categoryphoto.data );
          }
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})
//addnotes
 
Router.post("/addcatogary",middle,isAdmin,formidable(),async(req,res)=>{
    const {name} = req.fields
    const {categoryphoto} = req.files;
   
   try {
    
     switch (true) {
       case !name:
         return res.status(500).send({ error: "Name is Required" });
         case categoryphoto && categoryphoto.size > 1000000:
           return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
          }
          if( categoryphoto && categoryphoto.size > 1000000){
            
            return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
          }
          
          const checkcatogary = await catogarymodule.findOne({ name });
        if(checkcatogary){
            return res.status(200).send({
              success: false,
                message: "Category Already Exisits",
              });
        }
        const catogar = new catogarymodule({
          name,
          slug: slugify(name),
          
        })
        if (categoryphoto) {
          catogar.categoryphoto.data = fs.readFileSync(categoryphoto.path);
            catogar.categoryphoto.contentType = categoryphoto.type;
          }
          const savecatogary = await catogar.save()
          res.json(savecatogary)
          
        } catch (error) {
          res.status(500).send("internal errror")
        }
        })




Router.put('/updatecatogary11/:id',middle,isAdmin,formidable(),async(req,res)=>{
 
  try {

    let { name} =req.fields;
   const { categoryphoto } = req.files;
     

 
  

   switch (true) {
     case !name:
       return res.status(500).send({ error: "Name is Required" });
     
    
         case categoryphoto && categoryphoto.size > 1000000:
           return res
             .status(500)
             .send({ error: "photos is Required and should be less then 1mb" });
   }




   const products = await catogarymodule.findByIdAndUpdate(
     req.params.id,
     {name, slug : name  },
     { new: true }
   );
 
   if (categoryphoto) {
   
     products.categoryphoto.data = fs.readFileSync(categoryphoto.path);
     products.categoryphoto.contentType = categoryphoto.type;
   }
  
   await products.save();


   res.status(201).send({
     success: true,
     message: "Product Updated Successfully",
     products,
   });
 }catch (error) {
   res.status(402).send({
     success: false,
     message: "internal server error",
   });
   }
  })





 

Router.delete("/deletecatogary/:id",middle,isAdmin,async(req,res)=>{

  try {
    
    let category = await  catogarymodule.findById( req.params.id)
    
    if(!category){return res.status(404).send("not found")}
    
    category =await catogarymodule.findByIdAndDelete(req.params.id)
    res.json({"success":"category has been deleted",category})
  } catch (error) {
    res.status(500).send("internal errror")
  }
  })
  module.exports =Router