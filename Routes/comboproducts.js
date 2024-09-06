const express = require("express");
const Router = express.Router();
const middle = require('../middleware/middle');
 const combomocudle = require("../module/comboproduct");
const productmodule = require("../module/product");
const fs = require("fs");
const product = require("../module/product");
const order = require("../module/order");
const ObjectId = require('mongodb').ObjectId;

// Add combo product
Router.post("/addcomboproduct", middle, async (req, res) => {
  let { products, Serialrequired, othername } = req.body;

  if (!products || products.length === 0) {
    return res.status(500).send({ error: 'products is Required' });
  }

  let args = {
    $or: [
      { othername: othername },
      { name: othername }
    ]
  };

  try {
    const comboothername1 = await combomocudle.findOne(args);
    if (comboothername1) {
      return res.status(200).send({
        success: false,
        message: "serial Already Exists",
        data: comboothername1
      });
    }

    const othername1 = await productmodule.findOne({ othername: othername });
    if (othername1) {
      return res.status(200).send({
        success: false,
        message: "serial Already Exists",
        data: othername1
      });
    }

    // Use Promise.all to fetch all product names concurrently
    const productNames = await Promise.all(
      products.map(async (productId) => {
        const productDoc = await product.findById(productId).select("name");
        if (productDoc) {
          return productDoc.name;
        } else {
          throw new Error(`Product with ID ${productId} not found`);
        }
      })
    );

    // Concatenate product names with a + symbol
    const combinedName = productNames.join('+');

    // Create the combo product
    const product1 = new combomocudle({
      name: combinedName,
      products,
      Serialrequired,
      othername
    });

    // Save the combo product
    const saveproduct = await product1.save();
    res.status(200).send({
      success: true,
      message: "Combo Successfully created",
      
    });  
   } catch (error) {
    console.error('Error creating combo product:', error);
    res.status(500).send({ error: error.message || 'An error occurred while creating the combo product' });
  }
});

// Update combo product
Router.put("/updatecombo/:id", middle, async (req, res) => {
  const { id } = req.params;
  const { name, category, MRP, salingprice, othername } = req.body;

  try {
    const getproname = await combomocudle.findById(id);
    if (name !== undefined) {
      await order.findOneAndUpdate({ Product: getproname?.name }, { Product: name }, { new: true });
    }

    const updateData = {};
    updateData.othername = othername;
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (MRP !== undefined) updateData.MRP = MRP;
    if (salingprice !== undefined) updateData.salingprice = salingprice;

    const updatedOrder = await combomocudle.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedOrder) {
      return res.status(404).send({ error: "product not found" });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating combo product:', error);
    res.status(500).send({ error: 'An error occurred while updating the combo product' });
  }
});

// Fetch combos for admin
Router.get('/fetchcomboforadmin', middle, async (req, res) => {
  try {
    const comboproductsS = await combomocudle.find({});
    let array1 = comboproductsS.map(product => product.name);
    let othername = comboproductsS.map(product => product.othername);

    let array2 = othername.flat().filter(item => typeof item === 'string');
    let comboproducts = array1.concat(array2);
     res.status(200).send({ comboproducts });
  } catch (err) {
    console.error('Error fetching combo products for admin:', err);
    res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});

// Fetch combos for admin with pagination
Router.get('/fetchcombosforadmin/:page', middle, async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 20; // Number of products per page
    const skip = (page - 1) * limit;

    const products = await combomocudle.aggregate([
      { $skip: skip },
      { $limit: limit },
      { $sort: { _id: 1 } } // Sort by ID or any other field
    ]);
    const totalCount = await combomocudle.countDocuments({});

    res.status(200).send({ products, totalCount });
  } catch (err) {
    console.error('Error fetching paginated combo products for admin:', err);
    res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});

// Delete combo product
Router.delete("/deleteproduct/:id", middle, async (req, res) => {
  try {
    let product = await combomocudle.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    let avinorder = await order.findOne({ Product: product.name });
    if (avinorder) {
      return res.status(404).send("You can't delete this product");
    }

    product = await combomocudle.findByIdAndDelete(req.params.id);
    res.json({ "success": "Product has been deleted", product });
  } catch (error) {
    console.error('Error deleting combo product:', error);
    res.status(500).send({ error: 'An error occurred while deleting the product' });
  }
});

// Fetch single combo product by name
Router.get('/fetchsinglecombo/:name', middle, async (req, res) => {
  try {
    let othername = req.params.name;

    if (!othername) {
      return res.status(200).send({});
    }

    let args = {
      $or: [
        { othername: othername },
        { name: othername }
      ]
    };

    const othername1 = await combomocudle.findOne(args);
    if (!othername1) {
      return res.status(200).send({});
    }
 
    res.status(200).send({ othername1 });
  } catch (err) {
    console.error('Error fetching single combo product:', err);
    res.status(500).send({ error: 'An error occurred while fetching the product' });
  }
});

// Fetch product names
Router.get('/productnames', middle, async (req, res) => {
  try {
    const products = await combomocudle.find({}).select("name othername");
    let array1 = products.map(product => product.name);
    let othername = products.map(product => product.othername);
    let array2 = othername.flat().filter(item => typeof item === 'string');
    let productNames = array1.concat(array2);
    res.status(200).send({ productNames });
  } catch (err) {
    console.error('Error fetching product names:', err);
    res.status(500).send({ error: 'An error occurred while fetching product names' });
  }
});

module.exports = Router;
