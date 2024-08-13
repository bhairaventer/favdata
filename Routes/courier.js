const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
 const couriermodule = require("../module/Courier")
const { default: slugify } = require("slugify")
const isAdmin = require("../middleware/admin")
const formidable = require("express-formidable")
const fs = require("fs")
const order = require("../module/order")




//fetchallnotes
Router.get ('/fetchallcourier',async(req,res)=>{
    try{
        const courier = await couriermodule.find({})
        res.json(courier)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})



//single
Router.get ('/fetchcatogary/:id',async(req,res)=>{
    let id = req.params.id
     try{
        const catogary = await couriermodule.findById( id).select("-categoryphoto")
        res.json(catogary)
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})





//addnotes
 
Router.post("/addcourier",middle,isAdmin,async(req,res)=>{
    const {name} = req.body
    
   try {
    
     switch (true) {
       case !name:
         return res.status(500).send({ error: "Name is Required" });
        
          }
        
          
          const checkcourior = await couriermodule.findOne({ name });
        if(checkcourior){
            return res.status(200).send({
              success: false,
                message: "Category Already Exisits",
              });
        }
        const catogar = new couriermodule({
          name  
        })
       
          const savecatogary = await catogar.save()
          res.json(savecatogary)
          
        } catch (error) {
          res.status(500).send("internal errror")
        }
        })







        Router.put('/updatecourier/:id', async (req, res) => {
          try {
            const { name } = req.body;
        
            // Validate input
            if (!name) {
              return res.status(400).send({ error: 'Name is required' });
            }
        
            console.log(`Updating courier with ID: ${req.params.id}, Name: ${name}`);
        
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
        




 

Router.delete("/deletecourier/:id",async(req,res)=>{

  try {
    
    let category = await  couriermodule.findById( req.params.id)
    console.log(category)
    if(!category){return res.status(404).send("not found")}
    let checkorder = await  order.findOne( {courier :req.params.id})
    console.log(checkorder)
    if(checkorder || checkorder !== null){return res.status(404).send("you can't delete")}
    category =await couriermodule.findByIdAndDelete(req.params.id)
    res.json({"success":"category has been deleted",category})
  } catch (error) {
    res.status(500).send("internal errror")
  }
  })






  Router.get('/fetchallcourierdetail', async (req, res) => {
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
                    // updatedAt
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
        console.error(error);
        res.status(500).send('Server error');
    }
  });


  module.exports =Router