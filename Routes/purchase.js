const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
 const purchasemodule = require("../module/purchase")
const productmodule = require("../module/product")
 const ObjectId = require('mongodb').ObjectId;


 

Router.post("/addpurchase", middle, async (req, res) => {
  try {
    let { productname, billdate, billno, supplier } = req.body;

    // Validation
    if (!productname) return res.status(400).send({ error: 'Product name is required' });
    if (!billdate) return res.status(400).send({ error: 'Bill date is required' });
    if (!supplier) return res.status(400).send({ error: 'Supplier is required' });
    if (!billno) return res.status(400).send({ error: 'Bill number is required' });

    // Check if the purchase already exists
    const existingPurchase = await purchasemodule.findOne({ billno });
    if (existingPurchase) {
      return res.status(200).send({
        success: false,
        message: "Purchase already exists",
      });
    }

    // Create new purchase
    const newPurchase = new purchasemodule({
      name: productname,
      Supplier: supplier,
      billdate,
      billno
    });

    // Save the new purchase
    const savedPurchase = await newPurchase.save();

    // Update stock
    await updateProductStock(newPurchase);

    // Send success response
    res.status(201).send({
      success: true,
      message: "Purchase successfully created",
      data: savedPurchase
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'An error occurred while processing your request' });
  }
});

 
 
 

const updateProductStock = async (product1) => {
  try {
    for (const element of product1?.name) {
      // Fetch the existing purchase stock and serial numbers
      const productData = await productmodule.findById(element.productid).select("purchasestock serialNumbers");
      
      if (!productData) {
        console.error(`Product ${element.productid} not found.`);
        continue;
      }

      // Calculate the new total purchase stock
      let existingStock = parseInt(productData.purchasestock, 10) || 0;
      let newAmount = parseInt(element.quantity, 10);
      let totalStock = existingStock + newAmount;

      // Determine new serial numbers with cost
      let existingSerialNumbers = productData.serialNumbers || [];
      
      // Convert existing serial numbers to a map for easy lookup
      let existingSerialMap = new Map(existingSerialNumbers.map(sn => [sn.serial, sn.cost]));
      
      // New serial numbers with cost based on rateper
      let newSerialNumbers = Array.isArray(element.serialNumbers) 
        ? element.serialNumbers.map(serial => ({ serial: serial.trim(), cost: parseFloat(element.rateper) })) 
        : element.serialNumbers?.split(',').map(serial => ({ serial: serial.trim(), cost: parseFloat(element.rateper) }));

      // Merge existing and new serial numbers
      newSerialNumbers.forEach(sn => existingSerialMap.set(sn.serial, sn.cost));
      
      // Convert the map back to an array
      let updatedSerialNumbers = Array.from(existingSerialMap.entries()).map(([serial, cost]) => ({ serial, cost }));
      
      // Update the product's purchase stock and serial numbers
      await productmodule.findByIdAndUpdate(
        element.productid,
        { purchasestock: totalStock, serialNumbers: updatedSerialNumbers }
      );

      console.log(`Updated stock for ${element.productid}: ${totalStock}`);
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
  }
};





// Call the function with your product data


Router.get('/fetchpurchase/:page', middle, async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 20; // Number of products per page
    const skip = (page - 1) * limit;
    
    const searchTerm = req.query.search || ""; // Get search term from query params
    const checkproduct = await productmodule.findOne({name: searchTerm });
    console.log(checkproduct)
    const isNumber = !isNaN(searchTerm) && searchTerm.trim() !== ""; // Check if searchTerm is a number
    
    // Build the search query
    let purchaseQuery = {
      $or: [
        { Supplier: { $regex: searchTerm, $options: 'i' } },
        { 'name.quantity': { $regex: searchTerm, $options: 'i' } },
         { 'name.productid': checkproduct?._id },
        { 'name.amount': { $regex: searchTerm, $options: 'i' } },
        { 'name.serialNumbers': { $regex: searchTerm, $options: 'i' } },
      ]
    };

    // If search term is a number, include numeric fields in the query
    if (isNumber) {
      purchaseQuery.$or.push(
        { 'name.rateper': Number(searchTerm) },
        { 'name.soldQuantity': Number(searchTerm) },
        { billno: Number(searchTerm) }
      );
    }

    // Execute the aggregation pipeline for the search query with pagination
    const purchase = await purchasemodule.aggregate([
      { $match: purchaseQuery },
      { $sort: { _id: 1 } }, // Sort by ID or other fields if needed
      { $skip: skip },
      { $limit: limit }
    ]);

    // Get the total count for pagination
    const totalCount = await purchasemodule.countDocuments(purchaseQuery);

    res.status(200).send({ purchase, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});




const mongoose = require('mongoose');

 
Router.get('/fetchsinglepurchase/:id',middle, async (req, res) => {
  try {
      const purchaseId = req.params.id;

      const purchase = await purchasemodule.aggregate([
          // Match the specific purchase by ID
          { $match: { _id: new mongoose.Types.ObjectId(purchaseId) } },

          // Unwind the name array to work with each product individually
          { $unwind: "$name" },

          // Use $lookup to populate the 'productid' field in the 'name' array
          {
              $lookup: {
                  from: 'products', // The name of the Products collection
                  localField: 'name.productid', // The field in the Purchase schema
                  foreignField: '_id', // The field in the Products schema
                  as: 'productDetails' // The new array field where product details will be stored
              }
          },

          // Unwind the productDetails array to merge it with the name array
          {
              $unwind: {
                  path: '$productDetails',
                  preserveNullAndEmptyArrays: true // To keep the purchase even if it doesn't have a product linked
              }
          },

          // Group back to reconstruct the name array with product details
          {
              $group: {
                  _id: "$_id",
                  name: {
                      $push: {
                          productid: "$name.productid",
                          quantity: "$name.quantity",
                          amount: "$name.amount",
                          rateper: "$name.rateper",
                          soldQuantity: "$name.soldQuantity",
                          serialNumbers: "$name.serialNumbers",
                          productname: "$productDetails.name" // Assuming 'name' is the field in Products collection
                      }
                  },
                  billno: { $first: "$billno" },
                  billdate: { $first: "$billdate" },
                  Supplier: { $first: "$Supplier" }
              }
          }
      ]);

      if (purchase.length > 0) {
          res.status(200).send({ purchase: purchase[0] });
      } else {
          res.status(404).send({ error: 'Purchase not found' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching the purchase' });
  }
});




Router.put("/updatepurchase/:id",middle, async (req, res) => {
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
      // Fetch the existing purchase stock and serial numbers
      const productData = await productmodule.findById(element.productid).select("purchasestock serialNumbers");
      
      if (!productData) {
        console.error(`Product ${element.productid} not found.`);
        continue;
      }

      // Calculate the new total purchase stock
      let existingStock = parseInt(productData.purchasestock, 10) || 0;
      let newAmount = parseInt(element.quantity, 10);
      let totalStock = existingStock - newAmount;

      // Determine new serial numbers
      let existingSerialNumbers = productData.serialNumbers || [];
      let newSerialNumbers = Array.isArray(element.serialNumbers) 
        ? element.serialNumbers.map(serial => serial.trim()) 
        : element.serialNumbers.split(',').map(serial => serial.trim());

      // Convert existing serial numbers to a map for easy lookup
      let existingSerialMap = new Map(existingSerialNumbers.map(sn => [sn.serial, sn.cost]));

      // Filter existing serial numbers to remove new serial numbers
      let updatedSerialNumbers = existingSerialNumbers.filter(
        sn => !newSerialNumbers.includes(sn.serial)
      );

      // Update the product's purchase stock and serial numbers
      await productmodule.findByIdAndUpdate(
        element.productid,
        { purchasestock: totalStock, serialNumbers: updatedSerialNumbers }
      );

      console.log(`Updated stock for ${element.productid}: ${totalStock}`);
      console.log(`Updated serial numbers for ${element.productid}: ${updatedSerialNumbers}`);
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
  }
};




Router.delete("/deletepurchase/:id",middle, async(req,res)=>{
  try {
  
  let purchase = await  purchasemodule.findById( req.params.id) 
  await removeProductStock(purchase)

   if(!purchase){return res.status(404).send("not found")}
    
   purchase =await purchasemodule.findByIdAndDelete(req.params.id)
  res.json({"success":"category has been deleted",purchase})
    
} catch (error) {
    
}
})



////purchase summary 

 

Router.get('/stock-summary', async (req, res) => {
  try {
    // Step 1: Aggregate purchase data, keeping different rates separate
    const purchases = await purchasemodule.aggregate([
      { $unwind: "$name" },
      {
        $group: {
          _id: "$name.productid",
          purchasedStock: { $sum: { $toInt: "$name.quantity" } },
          totalSold: { $sum: "$name.soldQuantity" },
          totalAmount: { $sum: { $toDouble: "$name.amount" } },
          details: {
            $push: {
              rateper: { $toDouble: "$name.rateper" },
              quantity: { $toInt: "$name.quantity" },
              soldQuantity: "$name.soldQuantity",
            }
          }
        }
      }
    ]);

    // Step 2: Prepare the stock summary
    const stockSummary = [];
    for (const purchase of purchases) {
      const product = await productmodule.findById(purchase._id);

      if (product) {
        let remainingStock = 0;
        let remainingAmount = 0;
        let soldAmount = 0;

        // Combine the details for different rates
        purchase.details.forEach(detail => {
          const remaining = detail.quantity - detail.soldQuantity;
          remainingStock += remaining;
          remainingAmount += remaining * detail.rateper;
          soldAmount += detail.soldQuantity * detail.rateper;
        });

        stockSummary.push({
          productId: product._id,
          productName: product.name,
          remainingStock: remainingStock,
          remainingAmount: remainingAmount,
          soldAmount: soldAmount,
          purchasedStock: purchase.purchasedStock,
          totalSold: purchase.totalSold,
          totalAmount: purchase.totalAmount
        });
      }
    }

    // Return the stock summary as JSON
    res.status(200).json(stockSummary);
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





//this is for single summery 


Router.get('/stock-summary/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // Step 1: Aggregate purchase data for the specific product
    const purchase = await purchasemodule.aggregate([
      { $unwind: "$name" },
      { $match: { "name.productid":new mongoose.Types.ObjectId(productId) } }, // Match the specific productId
      {
        $group: {
          _id: "$name.productid",
          purchasedStock: { $sum: { $toInt: "$name.quantity" } },
          totalSold: { $sum: "$name.soldQuantity" },
          totalAmount: { $sum: { $toDouble: "$name.amount" } },
          details: {
            $push: {
              rateper: { $toDouble: "$name.rateper" },
              quantity: { $toInt: "$name.quantity" },
              soldQuantity: "$name.soldQuantity",
            }
          }
        }
      }
    ]);

    // Step 2: Prepare the stock summary for the specific product
    if (purchase.length > 0) {
      const product = await productmodule.findById(purchase[0]._id);

      if (product) {
        let remainingStock = 0;
        let remainingAmount = 0;
        let soldAmount = 0;

        // Combine the details for different rates
        purchase[0].details.forEach(detail => {
          const remaining = detail.quantity - detail.soldQuantity;
          remainingStock += remaining;
          remainingAmount += remaining * detail.rateper;
          soldAmount += detail.soldQuantity * detail.rateper;
        });

        const stockSummary = {
          productId: product._id,
          productName: product.name,
          remainingStock: remainingStock,
          remainingAmount: remainingAmount,
          soldAmount: soldAmount,
          purchasedStock: purchase[0].purchasedStock,
          totalSold: purchase[0].totalSold,
          totalAmount: purchase[0].totalAmount
        };

        // Return the stock summary as JSON
        return res.status(200).json(stockSummary);
      }
    }

    // If the product or purchase data is not found
    res.status(404).json({ error: 'Product not found or no purchase data available' });
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports =Router
