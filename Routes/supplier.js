const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
  const isAdmin = require("../middleware/admin")
const suppliermodule = require("../module/supplier")
const supplier = require("../module/supplier")
const order = require("../module/order")
const purchase = require("../module/purchase")
  const ObjectId = require('mongodb').ObjectId;


Router.post("/addsupplier",middle,isAdmin,async(req,res)=>{
    let { name, GSTIN,addresh, mobile} = req.body;
    console.log(req.body)
      switch (true) {
      case !name:
        return res.status(500).send({ error: 'Name is Required' });
      case !GSTIN:
        return res.status(500).send({ error: 'Saling price is Required' });
      case !addresh:
        return res.status(500).send({ error: 'Cost is Required' });
      case !mobile:
        return res.status(500).send({ error: 'Category is Required' });
      
    }
  
        const product1 = new suppliermodule({
            name, GSTIN,addresh, Mobile :mobile
          
        })
       
        const saveproduct = await product1.save()
        res.json(saveproduct)

       


})

Router.get('/fetchsupplier/:page', async (req, res) => {
  try {
      const page = parseInt(req.params.page) || 1;
      const limit = 20; // Number of products per page
      const skip = (page - 1) * limit;

      const supplier = await suppliermodule.aggregate([
          { $skip: skip },
          { $limit: limit },
          { $sort: { _id: 1 } }, // Sort by ID or any other field
          
         
      ]);

 
      res.status(200).send({ supplier });
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});


Router.get('/suppliernames', async (req, res) => {
    try {
       
  
        const supplier = await suppliermodule.find({}).select("name")
        const supplierNames = supplier.map(product => product.name);
         
        res.status(200).send({ supplierNames });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while fetching products' });
    }
  });
  


  Router.put('/update/:id', async (req, res) => {
    try {
      const { name ,GSTIN,Mobile,address} = req.body;
       // Validate input
      if (!name) {
        return res.status(400).send({ error: 'Name is required' });
      }
  
      console.log(`Updating platform with ID: ${req.params.id}, Name: ${name}`);
  
      const updatedCourier = await suppliermodule.findByIdAndUpdate(
        req.params.id,
        { name,GSTIN,Mobile,addresh:address },
        { new: true }
      );
      console.log(updatedCourier)
  
      if (!updatedCourier) {
        return res.status(404).send({ error: 'Courier not found' });
      }
  
      res.status(200).send({
        message: 'platform updated successfully',
        courier: updatedCourier,
      });
    } catch (error) {
      console.error('Error updating platform:', error);
      res.status(500).send({ error: 'An error occurred while updating the platform' });
    }
  });
  
  
  
  
  
  
  
  Router.delete("/delete/:id",async(req,res)=>{
  
  try {
  
  let category = await  suppliermodule.findById( req.params.id)
  console.log(category)
  if(!category){return res.status(404).send("not found")}
  let checkorder = await  purchase.findOne( {Supplier :category.name})
  console.log(checkorder)
  if(checkorder || checkorder !== null){return res.status(404).send("you can't delete")}
  category =await suppliermodule.findByIdAndDelete(req.params.id)
  res.json({"success":"category has been deleted",category})
  } catch (error) {
  res.status(500).send("internal errror")
  }
  })


module.exports =Router
