const express = require("express");
const Router = express.Router();
const middle = require('../middleware/middle');
const couriermodule = require("../module/Courier");
const isAdmin = require("../middleware/admin");
const order = require("../module/order");

// Fetch all couriers
Router.get('/fetchallcourier',middle, async (req, res) => {
  try {
    const courier = await couriermodule.find({});
    res.json(courier);
  } catch (error) {
    console.error('Error fetching all couriers:', error);
    res.status(500).send("Internal error");
  }
});

// Fetch single category by ID
Router.get('/fetchcatogary/:id',middle, async (req, res) => {
  let id = req.params.id;
  try {
    const category = await couriermodule.findById(id).select("-categoryphoto");
    res.json(category);
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).send("Internal error");
  }
});

// Add courier
Router.post("/addcourier", middle, async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(500).send({ error: "Name is Required" });
    }

    const checkcourier = await couriermodule.findOne({ name });
    if (checkcourier) {
      return res.status(200).send({
        success: false,
        message: "Courier Already Exists",
      });
    }

    const newCourier = new couriermodule({ name });
    const savedCourier = await newCourier.save();
     res.status(200).send({
      success: true,
      message: "Courier Successfully created",
      
    }); 
  } catch (error) {
    console.error('Error adding courier:', error);
    res.status(500).send("Internal error");
  }
});

// Update courier
Router.put('/updatecourier/:id',middle, async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).send({ error: 'Name is required' });
    }

 
    const updatedCourier = await couriermodule.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!updatedCourier) {
      return res.status(404).send({ error: 'Courier not found' });
    }

    res.status(200).send({
      message: 'Courier updated successfully',
      courier: updatedCourier,
    });
  } catch (error) {
    console.error('Error updating courier:', error);
    res.status(500).send({ error: 'An error occurred while updating the courier' });
  }
});

// Delete courier
Router.delete("/deletecourier/:id",middle, async (req, res) => {
  try {
    let category = await couriermodule.findById(req.params.id);
     if (!category) {
      return res.status(404).send("Not found");
    }

    let checkorder = await order.findOne({ courier: req.params.id });
     if (checkorder) {
      return res.status(404).send("You can't delete this courier");
    }

    category = await couriermodule.findByIdAndDelete(req.params.id);
    res.json({ "success": "Courier has been deleted", category });
  } catch (error) {
    console.error('Error deleting courier:', error);
    res.status(500).send("Internal error");
  }
});

// Fetch all courier details
Router.get('/fetchallcourierdetail',middle, async (req, res) => {
  try {
    const totalSalesByPlatform = await order.aggregate([
      {
        $group: {
          _id: "$courier",
          totalSales: { $sum: "$Salesamount" },
          totalSalesQ: { $sum: 1 },
          totalLost: {
            $sum: {
              $cond: [{ $eq: ["$status", "Lost"] }, "$Salesamount", 0]
            }
          },
          totalLOSTQ: {
            $sum: {
              $cond: [{ $eq: ["$status", "Lost"] }, 1, 0]
            }
          },
          totalRTO: {
            $sum: {
              $cond: [{ $eq: ["$status", "RTO"] }, "$Salesamount", 0]
            }
          },
          totalRTOQ: {
            $sum: {
              $cond: [{ $eq: ["$status", "RTO"] }, 1, 0]
            }
          },
          totaldeliverd: {
            $sum: {
              $cond: [{ $eq: ["$status", "Delivered"] }, "$Salesamount", 0]
            }
          },
          totaldeliverdQ: {
            $sum: {
              $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0]
            }
          }
        }
      }
    ]);
    res.json(totalSalesByPlatform);
  } catch (error) {
    console.error('Error fetching all courier details:', error);
    res.status(500).send('Server error');
  }
});

module.exports = Router;
