const express = require("express");
const Router = express.Router();
const middle = require('../middleware/middle');
const categorymodule = require("../module/category");
 const order = require("../module/order");

// Fetch all categorys
Router.get('/fetchallcategory', middle, async (req, res) => {
    try {
      // Extract the search term from query parameters, default to an empty string if not provided
      const searchTerm = req.query.name || '';
  
      // Find categories that match the search term (case-insensitive)
      const category = await categorymodule.find({
        name: { $regex: searchTerm, $options: 'i' }  // 'i' for case-insensitive
      });
  
      res.json(category);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send("Internal error");
    }
  });
  

// Fetch single category by ID
Router.get('/fetchcatogary/:id',middle, async (req, res) => {
  let id = req.params.id;
  try {
    const category = await categorymodule.findById(id).select("-categoryphoto");
    res.json(category);
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).send("Internal error");
  }
});

// Add category
Router.post("/addcategory", middle, async (req, res) => {
  const { name } = req.body;
console.log(name)
  try {
    if (!name) {
      return res.status(500).send({ error: "Name is Required" });
    }

    const checkcategory = await categorymodule.findOne({ name });
    if (checkcategory) {
      return res.status(200).send({
        success: false,
        message: "Category Already Exists",
       
      });
    }

    const newcategory = new categorymodule({ name });
    const savedcategory = await newcategory.save();
    res.json({
      success: true,
      message: "Category Successfully created",
      data: newcategory
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send("Internal error");
  }
});

// Update category
Router.put('/updatecategory/:id',middle, async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).send({ error: 'Name is required' });
    }

 
    const updatedcategory = await categorymodule.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!updatedcategory) {
      return res.status(404).send({ error: 'category not found' });
    }

    res.status(200).send({
      message: 'category updated successfully',
      category: updatedcategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send({ error: 'An error occurred while updating the category' });
  }
});

// Delete category
Router.delete("/deletecategory/:id",middle, async (req, res) => {
  try {
    let category = await categorymodule.findById(req.params.id);
     if (!category) {
      return res.status(404).send("Not found");
    }

    let checkorder = await order.findOne({ category: req.params.id });
     if (checkorder) {
      return res.status(404).send("You can't delete this category");
    }

    category = await categorymodule.findByIdAndDelete(req.params.id);
    res.json({ "success": "category has been deleted", category });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send("Internal error");
  }
});

// Fetch all category details
 

module.exports = Router;
