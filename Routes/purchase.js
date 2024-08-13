const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
  const isAdmin = require("../middleware/admin")
const purchasemodule = require("../module/purchase")
const productmodule = require("../module/product")
 const ObjectId = require('mongodb').ObjectId;


Router.post("/addpurchase",middle,isAdmin,async(req,res)=>{


     let { productname, billdate,billno, supplier} = req.body;
      switch (true) {
      case !productname:
        return res.status(500).send({ error: 'Name is Required' });
       
      case !billdate:
        return res.status(500).send({ error: 'Cost is Required' });
      case !supplier:
        return res.status(500).send({ error: 'Category is Required' });
      case !billno:
        return res.status(500).send({ error: 'Category is Required' });
      
    }
  
        const product1 = new purchasemodule({
           name: productname, Supplier:supplier,billdate,billno
          
        })
       
        const saveproduct = await product1.save()
        res.json(saveproduct)
 
        updateProductStock(product1);



})

 
 
 
 

const updateProductStock = async (product1) => {
  try {
    for (const element of product1?.name || []) {
      console.log("Processing element:", element);

      // Fetch the existing purchase stock and serial numbers
      const productData = await productmodule.findOne({ name: element.productname }).select("purchasestock serialNumbers");
      console.log("Fetched product data:", productData);

      if (!productData) {
        console.error(`Product ${element.productname} not found.`);
        continue;
      }

      // Calculate the new total purchase stock
      let existingStock = parseInt(productData.purchasestock, 10) || 0;
      let newAmount = parseInt(element.quantity, 10);
      let totalStock = existingStock + newAmount;
      console.log(`Existing stock: ${existingStock}, New amount: ${newAmount}, Total stock: ${totalStock}`);

      // Determine new serial numbers
      let existingSerialNumbers = productData.serialNumbers || [];
      let newSerialNumbers = Array.isArray(element.serialNumbers) 
        ? element.serialNumbers.map(serial => serial.trim()) 
        : element.serialNumbers.split(',').map(serial => serial.trim());
      console.log("Existing serial numbers:", existingSerialNumbers);
      console.log("New serial numbers:", newSerialNumbers);

      // Combine and filter unique serial numbers
      let updatedSerialNumbers = Array.from(new Set([...existingSerialNumbers, ...newSerialNumbers]));
      console.log("Updated serial numbers:", updatedSerialNumbers);

      // Update the product's purchase stock and serial numbers
      await productmodule.findOneAndUpdate(
        { name: element.productname },
        { purchasestock: totalStock, serialNumbers: updatedSerialNumbers }
      );

      console.log(`Updated stock for ${element.productname}: ${totalStock}`);
      console.log(`Updated serial numbers for ${element.productname}: ${updatedSerialNumbers}`);
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
  }
};




// Call the function with your product data


Router.get('/fetchpurchase/:page', async (req, res) => {
  try {
      const page = parseInt(req.params.page) || 1;
      const limit = 20; // Number of products per page
      const skip = (page - 1) * limit;

      const purchase = await purchasemodule.aggregate([
          { $skip: skip },
          { $limit: limit },
          { $sort: { _id: 1 } }, // Sort by ID or any other field
          
         
      ]);
      const totalCount = await purchasemodule.countDocuments({});
 
      res.status(200).send({ purchase ,totalCount});
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});
const mongoose = require('mongoose');

Router.get('/fetchsinglepurchase/:id', async (req, res) => {
  try {
      const purchaseId = req.params.id;
      console.log(purchaseId)
      const purchase = await purchasemodule.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(purchaseId) } }
    ]);
       res.status(200).send({ purchase: purchase[0] });
   } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching the purchase' });
  }
});




Router.put("/updatepurchase/:id", async (req, res) => {
  const { id } = req.params;
  const {name,billno,billdate,Supplier } = req.body;
  const dataforremove = await purchasemodule.findById(id);
 await removeProductStock(dataforremove)
 
 


   
   const updateData = {};

  // Add fields to updateData only if they are defined
  if (name !== undefined) updateData.name = name;
  if (billno !== undefined) updateData.billno = billno;
  if (billdate !== undefined) updateData.billdate = billdate;
  if (Supplier !== undefined) updateData.Supplier = Supplier;
  

 
      const updatedOrder = await purchasemodule.findByIdAndUpdate(id, updateData, { new: true });
      updateProductStock(updatedOrder)
      if (!updatedOrder) {
          return res.status(404).send({ error: "product not found" });
      }
       res.json(updatedOrder);
 
});


const removeProductStock = async (product1) => {
  try {
    for (const element of product1?.name || []) {
      console.log("Processing element:", element);

      // Fetch the existing purchase stock and serial numbers
      const productData = await productmodule.findOne({ name: element.productname }).select("purchasestock serialNumbers");
      console.log("Fetched product data:", productData);

      if (!productData) {
        console.error(`Product ${element.productname} not found.`);
        continue;
      }

      // Calculate the new total purchase stock
      let existingStock = parseInt(productData.purchasestock, 10) || 0;
      let newAmount = parseInt(element.quantity, 10);
      let totalStock = existingStock - newAmount;
      console.log(`Existing stock: ${existingStock}, New amount: ${newAmount}, Total stock: ${totalStock}`);

   



      let existingSerialNumbers = productData.serialNumbers || [];
      let newSerialNumbers = Array.isArray(element.serialNumbers) 
        ? element.serialNumbers.map(serial => serial.trim()) 
        : element.serialNumbers.split(',').map(serial => serial.trim());
      
      console.log("Existing serial numbers:", existingSerialNumbers);
      console.log("New serial numbers:", newSerialNumbers);
      
      // Filter existing serial numbers to remove new serial numbers
      let updatedSerialNumbers = existingSerialNumbers.filter(
        serial => !newSerialNumbers.includes(serial)
      );
      
      console.log("Updated serial numbers (removed new from existing):", updatedSerialNumbers);





      // Update the product's purchase stock and serial numbers
      await productmodule.findOneAndUpdate(
        { name: element.productname },
        { purchasestock: totalStock, serialNumbers: updatedSerialNumbers }
      );

      console.log(`Updated stock for ${element.productname}: ${totalStock}`);
      console.log(`Updated serial numbers for ${element.productname}: ${updatedSerialNumbers}`);
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
  }
};




Router.delete("/deletepurchase/:id", async(req,res)=>{
  try {
  
  let purchase = await  purchasemodule.findById( req.params.id) 
  await removeProductStock(purchase)

   if(!purchase){return res.status(404).send("not found")}
    
   purchase =await purchasemodule.findByIdAndDelete(req.params.id)
  res.json({"success":"category has been deleted",purchase})
    
} catch (error) {
    
}
})

module.exports =Router
