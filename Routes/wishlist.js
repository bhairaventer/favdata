const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const fs = require('fs')
const usermodule = require("../module/user")
const cartmodule = require("../module/cart")
const productmodule = require("../module/product")
const wishlistmodule = require("../module/wishlist")


Router.get('/addtowishlist/:id',middle,async(req,res)=>{
    
        const wpid = req.params.id
             
            
            
        const products = await productmodule.findById(wpid).select("_id")

        if(!products){
         return   res.status(404).send("not product ")
        }
        const wish = await wishlistmodule.findOne({wpid,user:req.user.id})

   if(wish){
       console.log("added")
    return   res.status(404).send("product added ")
   }
    try {
        
  
        
         
            const cartobh = new wishlistmodule({
                user : req.user.id,
                wpid: wpid,
            })
            
            const cartdata = await cartobh.save();
            res.json(cartdata)
        } catch (error) {
        
        }
        
})


Router.get('/getwishlist/:page', middle, async (req, res) => {
    try {
        const perPage = 8;
        const page = req.params.page  
        const wishlist = await wishlistmodule.find({ user: req.user.id }).populate({
            path: 'wpid',
            model: 'Products'
        }).skip((page - 1) * perPage).limit(perPage);

        const totalWish = await wishlistmodule.countDocuments({ user: req.user.id });

        if (!wishlist || wishlist.length === 0) {
            return         res.json({ wishlist, totalWish });

        }

        console.log("Total wishlists:", totalWish);
        console.log("Wishlist items:", wishlist.length);

        res.json({ wishlist, totalWish });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ error: "Internal server error" }); // Generic error response
    }
});



Router.delete ('/deletewishlist/:id',middle,async(req,res)=>{
    
       const id = req.params.id
        try {
        
       
        const cart = await wishlistmodule.findOne({wpid:id , user:req.user.id})  
         if(!cart){return res.status(404).send("not found")}
        if(cart.user.toString()!== req.user.id){
            return res.status(401).send("not allowed")
        }
        let newcart = await wishlistmodule.findOneAndDelete({wpid:id,user:req.user.id})
 
        res.json({"success":"note has been deleted"})
        
    } catch (error) {
        
        res.json({"failed":"note has note been deleted"})
    }
})




Router.get('/checkwishlist/:id',middle,async(req,res)=>{
    
    const productid = req.params.id
  let user = req.user.id
 try {
    const checkwishlist2 = await wishlistmodule.findOne({ user: user, wpid: productid })
    // const checkcart2 = await cartmodule.find({user}=>{productid})
    

   if(!checkwishlist2){
    res.json({"success":false})
    
   }
    
     if(checkwishlist2){
         
        res.json({"success":true })
           }
           else{
            res.json({"success":false})
           }
        } catch (error) {
    
}})

Router.get('/checkallwishlist',middle,async(req,res)=>{
    
  let user = req.user.id
 try {
    const checkwishlist2 = await wishlistmodule.find({ user: user}).select('wpid')
    // const checkcart2 = await cartmodule.find({user}=>{productid})
    

   if(!checkwishlist2){
    res.json({"data":checkwishlist2})
    
   }
    
     if(checkwishlist2){
        const arrayOfIds = checkwishlist2.map(obj => obj.wpid);
        
        res.json({"data":arrayOfIds })
           }
           else{
            res.json({"data":arrayOfIds})
           }
        } catch (error) {
    
}})

 

module.exports =Router