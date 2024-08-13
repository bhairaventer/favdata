const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
 const Platformmodule = require("../module/platform")
const { default: slugify } = require("slugify")
const isAdmin = require("../middleware/admin")
const formidable = require("express-formidable")
const fs = require("fs")
const order = require("../module/order")




//fetchallnotes
Router.get ('/fetchallPlatform',async(req,res)=>{
    try{
        const Platform = await Platformmodule.find({})
        res.json(Platform)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})


Router.get('/fetchallPlatformdetail', async (req, res) => {
  try {



    
      const totalSalesByPlatform = await order.aggregate([
        {
          $lookup: {
              from: "platforms",          // The collection to join
              localField: "Platform",     // Field from the `order` collection
              foreignField: "_id",        // Field from the `platforms` collection
              as: "platformInfo"          // Alias for the joined data
          }
      },
      {
          $unwind: "$platformInfo"        // Deconstructs the array field from the previous lookup
      },
          {
          
              $group: {
                  _id: "$platformInfo.name",
                  totalSales: { $sum: "$Salesamount" },
                  totalSalesQ: { $sum: 1 },
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
                  totalDTO: { 
                      $sum: { 
                          $cond: [{ $eq: ["$status", "DTO"] }, "$Salesamount", 0] 
                      } 
                  },
                  totalDTOQ: { 
                      $sum: { 
                          $cond: [{ $eq: ["$status", "DTO"] }, 1, 0] 
                      } 
                  },
                  totalrefund: { 
                      $sum: { 
                          $cond: [{ $eq: ["$refundCondition", "YES"] }, "$Salesamount", 0] 
                      } 
                  },
                  // updatedAt
                  totalrefundQ: { 
                      $sum: { 
                          $cond: [{ $eq: ["$refundCondition", "YES"] }, 1, 0] 
                      } 
                  }
                  
              }
          }
      ])
      res.json(totalSalesByPlatform);
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});



//single
Router.get('/fetchplatform/:name', async (req, res) => {
  const name = req.params.name.toLowerCase(); // Ensure case-insensitivity
console.log(name,"this this this")
  try {
      const platform = await Platformmodule.findOne({ name: name });

      if (!platform) {
          // Send a 404 Not Found response if the platform is not found
          return res.status(404).json({ message: 'Platform not found' });
      }

      // Send the found platform data
      res.json(platform);
  } catch (error) {
      console.error('Error fetching platform:', error);
      // Send a 500 Internal Server Error response for unexpected errors
      res.status(500).json({ message: 'Internal server error' });
  }
});


Router.put('/updateplatform/:id', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).send({ error: 'Name is required' });
    }

    console.log(`Updating platform with ID: ${req.params.id}, Name: ${name}`);

    const updatedCourier = await Platformmodule.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

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







Router.delete("/deleteplatform/:id",async(req,res)=>{

try {

let category = await  Platformmodule.findById( req.params.id)
console.log(category)
if(!category){return res.status(404).send("not found")}
let checkorder = await  order.findOne( {Platform : req.params.id})
console.log(checkorder)
if(checkorder || checkorder !== null){return res.status(404).send("you can't delete")}
category =await Platformmodule.findByIdAndDelete(req.params.id)
res.json({"success":"category has been deleted",category})
} catch (error) {
res.status(500).send("internal errror")
}
})




//addnotes
 
Router.post("/addPlatform",middle,isAdmin,async(req,res)=>{
    const {name} = req.body
    console.log(name)
   try {
    
     switch (true) {
       case !name:
         return res.status(500).send({ error: "Name is Required" });
        
          }
        
          
          const checkPlatform = await Platformmodule.findOne({ name });
        if(checkPlatform){
            return res.status(200).send({
              success: false,
                message: "Platform Already Exisits",
              });
        }
        const catogar = new Platformmodule({
          name  
        })
       
          const savePlatform = await catogar.save()
          res.json(savePlatform)
          
        } catch (error) {
          res.status(500).send("internal errror")
        }
        })








 
  module.exports =Router