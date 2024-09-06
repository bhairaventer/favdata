const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
 const suppliermodule = require("../module/supplier")
const supplier = require("../module/supplier")
const order = require("../module/order")
const purchase = require("../module/purchase")
  const ObjectId = require('mongodb').ObjectId;


  Router.post("/addsupplier", middle, async (req, res) => {
    let { name, GSTIN, addresh, mobile } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).send({ error: 'Name is Required' });
    }
    if (!GSTIN) {
        return res.status(400).send({ error: 'GSTIN is Required' });
    }
    if (!addresh) {
        return res.status(400).send({ error: 'Address is Required' });
    }
    if (!mobile) {
        return res.status(400).send({ error: 'Mobile is Required' });
    }

    // Check if the supplier already exists (Optional)
    let existingSupplier = await suppliermodule.findOne({ GSTIN });
    console.log(existingSupplier)
    if (existingSupplier) {
        return res.status(200).send({ success: false, message: "Supplier already exists" });
    }

    try {
        const product1 = new suppliermodule({
            name,
            GSTIN,
            addresh,
            Mobile: mobile
        });

        const savedProduct = await product1.save();

        // Send success response after saving
        res.status(200).send({
            success: true,
            message: "Supplier Created Successfully",
            data: savedProduct
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'An error occurred while saving the supplier' });
    }
});

 
Router.get('/fetchsupplier/:page',middle, async (req, res) => {
  try {
      const page = parseInt(req.params.page) || 1;
      const limit = 20; // Number of products per page
      const skip = (page - 1) * limit;

      const supplierdata = await supplier.aggregate([
          { $skip: skip },
          { $limit: limit },
          { $sort: { _id: 1 } }, // Sort by ID or any other field
          
         
      ]);
      const totalCount = await supplier.countDocuments({});
 
      res.status(200).send({ supplierdata ,totalCount});
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});

Router.get('/suppliernames',middle, async (req, res) => {
    try {
       
  
        const supplier = await suppliermodule.find({}).select("name")
        const supplierNames = supplier.map(product => product.name);
         
        res.status(200).send({ supplierNames });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while fetching products' });
    }
  });
  


  Router.put('/update/:id',middle, async (req, res) => {
    try {
      const { name ,GSTIN,Mobile,address} = req.body;
       // Validate input
      if (!name) {
        return res.status(400).send({ error: 'Name is required' });
      }
  
      //console.log(`Updating platform with ID: ${req.params.id}, Name: ${name}`);
  
      const updatedCourier = await suppliermodule.findByIdAndUpdate(
        req.params.id,
        { name,GSTIN,Mobile,addresh:address },
        { new: true }
      );
      //console.log(updatedCourier)
  
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
  
  
  
  
  
  
  
  Router.delete("/delete/:id",middle, async(req,res)=>{
  
  try {
  
  let category = await  suppliermodule.findById( req.params.id)
  //console.log(category)
  if(!category){return res.status(404).send("not found")}
  let checkorder = await  purchase.findOne( {Supplier :category.name})
  //console.log(checkorder)
  if(checkorder || checkorder !== null){return res.status(404).send("you can't delete")}
  category =await suppliermodule.findByIdAndDelete(req.params.id)
  res.json({"success":"category has been deleted",category})
  } catch (error) {
  res.status(500).send("internal errror")
  }
  })


module.exports =Router
