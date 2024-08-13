const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const{body,validationResult} = require("express-validator")
const { default: slugify } = require("slugify")
const isAdmin = require("../middleware/admin")
const productmodule = require("../module/product")
const formidable = require("express-formidable")
const fs = require("fs")
 const order = require("../module/order")
const ObjectId = require('mongodb').ObjectId;
 





//addproduct
 
Router.post("/addproduct",async(req,res)=>{
    let { name, salingprice,category, Serialrequired,MRP,othername} = req.body;
   

     console.log(req.body)
    switch (true) {
      case !name:
        return res.status(500).send({ error: 'Name is Required' });
      case !salingprice:
        return res.status(500).send({ error: 'Saling price is Required' });
      case !MRP:
        return res.status(500).send({ error: 'MRP is Required' });
      case !category:
        return res.status(500).send({ error: 'Category is Required' });
    }
    
        const checkproduct = await productmodule.findOne({ name });
        const othername1 = await productmodule.findOne( {othername :othername}).select("othername")
  
        if(checkproduct){
            return res.status(200).send({
                success: false,
                message: "product Already Exisits",
              });
        }

        if(othername1){
          console.log("yery")
            return res.status(200).send({
                success: false,
                message: "serial Already Exisits",
                data:othername1
              });
        }


        const product1 = new productmodule({
           name, salingprice, category ,MRP,othername,Serialrequired
          
        })
       
        const saveproduct = await product1.save()
        res.json(saveproduct)
    
})


//get top 5 products 





Router.get('/top5products', async(req, res) => {
  try {
    const top5Products = await productmodule.find().sort({ totalsale: -1 }).limit(5);
    res.json(top5Products);
  } catch (error) {
    console.error('Error fetching top 5 products', error);
    res.status(500).send('Server Error');
  }
});



Router.put("/updateproduct/:id", async (req, res) => {
  const { id } = req.params;
  const {name,category,MRP,salingprice,othername } = req.body;
 

  const getproname = await productmodule.findById(id);
  if(name !== undefined){
    const changeOrdername = await order.findOne({Product:getproname?.name});
     const updatedOrder = await order.findOneAndUpdate({Product:getproname?.name}, {Product:name}, { new: true }); 
   }

   const updateData = {};
 

  // Add fields to updateData only if they are defined
  updateData.othername =othername
  if (name !== undefined) updateData.name = name;
  if (category !== undefined) updateData.category = category;
  if (MRP !== undefined) updateData.MRP = MRP;
  if (salingprice !== undefined) updateData.salingprice = salingprice;
  
  
      const updatedOrder = await productmodule.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedOrder) {
          return res.status(404).send({ error: "product not found" });
      }
       res.json(updatedOrder);
 
});


Router.delete("/deleteproduct/:id", async(req,res)=>{
    try {
    
    let product = await  productmodule.findById( req.params.id) 
    console.log(product)
    if(!product){return res.status(404).send("not found")}
let avinorder = await  order.findOne({Product:product.name}) 
 if(avinorder){return res.status(404).send("you can't delete this product")}
     
    product =await productmodule.findByIdAndDelete(req.params.id)
    res.json({"success":"category has been deleted",product})
      
  } catch (error) {
      
  }
})
module.exports =Router

 
 


Router.get('/fetchproductforadmin/:page', async (req, res) => {
  try {
      const page = parseInt(req.params.page) || 1;
      const limit = 20; // Number of products per page
      const skip = (page - 1) * limit;

      const products = await productmodule.aggregate([
          { $skip: skip },
          { $limit: limit },
          { $sort: { _id: 1 } }, // Sort by ID or any other field
          
          
      ]);
      const totalCount = await productmodule.countDocuments({});

 
      res.status(200).send({ products ,totalCount});
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});

//fetch product by othername 

Router.get('/fetchsingleproduct/:name', async (req, res) => {
  try {
    let othername = req.params.name;
    if(othername == null){ 
      return res.status(200).send({   });
    } 
    let args = {
      $or: [
        { othername: othername },
        { name: othername }
      ]
    };

    const othername1 = await productmodule.findOne(args).select("name").select("Serialrequired");

     if(!othername1){
      return res.status(200).send({   });
    }
    if(othername1 == null){ 
      return res.status(200).send({   });
    } 
    console.log(othername)
    res.status(200).send({ othername1 });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});



//PRODUCTNAME
Router.get('/productnames', async (req, res) => {
  try {
     

      const products = await productmodule.find({}).select("name").select("othername")
      let array1 = products.map(product => product.name);
      let othername = products.map(product => product.othername);
      let array2 = othername.flat().filter(item => typeof item === 'string');
      let productNames = array1.concat(array2);
         res.status(200).send({ productNames });
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});















