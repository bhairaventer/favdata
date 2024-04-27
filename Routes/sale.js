const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const{body,validationResult} = require("express-validator")
const salemodule = require("../module/sale")
const productmodule = require("../module/product")
const { default: slugify } = require("slugify")
const isAdmin = require("../middleware/admin")
const formidable = require("express-formidable")
const mongoose = require('mongoose');
const fs = require("fs")
//fetchallnotes
Router.get ('/fetchallsale',async(req,res)=>{
    try{
        const catogary = await salemodule.find({}).select("-photo")
        res.json(catogary)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})

//single
Router.get ('/fetchsale/:id',async(req,res)=>{
    let id = req.params.id
     try{
        const sale = await salemodule.findById(id).select("-photo")
        res.json(sale)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})
//single img get
Router.get ('/fetchsaleimg11/:id',async(req,res)=>{
    let id = req.params.id
     try{
        const sale = await salemodule.findById( id).select("photo")
       
        if (sale.photo.data ) {
            res.set("Content-type", sale.photo.contentType);
            return res.status(200).send(sale.photo.data );
          }
      
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})
//addnotes
 
Router.post("/addsale",middle,isAdmin,formidable(),async(req,res)=>{
    const {name,discount} = req.fields
    const { photo } = req.files;
     try {
      
  
    switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is Required" });
        case !discount:
          return res.status(500).send({ error: "discount is Required" });
        case photo && photo.size > 1000000:
          return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
      }
       if( photo && photo.size > 1000000){

           return res
           .status(500)
           .send({ error: "photo is Required and should be less then 1mb" });
        }
         
        const checkcatogary = await salemodule.findOne({ name });
        if(checkcatogary){
            return res.status(200).send({
                success: false,
                message: "sale Already Exisits",
              });
        }
        const catogar = new salemodule({
            name,discount
            
          
        })
        if (photo) {
            catogar.photo.data = fs.readFileSync(photo.path);
            catogar.photo.contentType = photo.type;
          }
        const savecatogary = await catogar.save()
        res.json(savecatogary)
      } catch (error) {
      
      }
     
})

//update notes
Router.put('/updatesale/:id',middle,isAdmin,formidable(),async(req,res)=>{
    const{name,discount}= req.fields
    const { photo } = req.files;
    if(photo && photo.size > 1000000){
 return res.status(500).send({ error: "photo is Required and should be less then 1mb" });
    }
     
    try {   
    const newcatogory = await salemodule.findByIdAndUpdate(
        req.params.id,
        { ...req.fields  },
        { new: true }
      );
     
      if (photo) {
         newcatogory.photo.data = fs.readFileSync(photo.path);
        newcatogory.photo.contentType = photo.type;
      }
      
      await newcatogory.save();
      res.status(201).send({
        success: true,
        message: "newcatogory Updated Successfully",
        newcatogory,
      });     
         
    } catch (error) { 
     } 
 
 
 
})


Router.delete("/deletesale/:id",middle,isAdmin,async(req,res)=>{
    let sale = await  salemodule.findById( req.params.id).select("-photo")
     if(!sale){return res.status(404).send("not found")}
    let product = await  productmodule.find({sale :'65ea9e5af97e02549190bb90'}).select("-photo0").select("-photo1").select("-photo2").select("-photo3")
 
      product.map(async (element) => {
        try {
          await productmodule.updateMany(
            { _id: element._id },
            {
              $set: { price: element.wdprice },
              $unset: { sale: 1 }
            }
          );
         } catch (error) {
          console.error('Update failed:', error);
        }
      });
    // sale =await salemodule.findByIdAndDelete(req.params.id).select("-photo")
    res.json({"success":"sale has been deleted",sale})
})
module.exports =Router