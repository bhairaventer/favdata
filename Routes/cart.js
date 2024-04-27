const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const fs = require('fs')
const usermodule = require("../module/user")
const cartmodule = require("../module/cart")
const productmodule = require("../module/product")



Router.post ('/addtocart/:id',middle,async(req,res)=>{
    const productid = req.params.id
         
            try {
                
                const products = await productmodule.findById(productid).populate("category").select("-photo0").select("-photo1").select("-photo2").select("-photo3")
                
                
                
                
                
                const cartobh = new cartmodule({
                productname: products.name || "",
                productslug: products.slug || "",
                productdescription: products.description || "",
                productprice: products.price || "",
                productcolor: products.color || "",
                productsize: products.size || "",
                productcategory: products.category?.name || "none", // Optional chaining operator
                productquantity: products.quantity || "",
                user: req.user.id || "",
                productid: products._id || "",
                totaladded: 1
            });
            const cartdata = await cartobh.save();
             res.json(cartdata)
            
        } catch (error) {
            res.status(500).send("internal errror")
        }
            
})


Router.get ('/getcart',middle,async(req,res)=>{

            let id = await {user:req.user.id}
     try {
        
         const cart = await cartmodule.find(id).populate({
            path: 'productid',
            model: 'Products',
            select: 'quantity'
        })
         
 

         if(!cart){
             return res.status(401).send("cart hsa not added yet")
            }
            
            
            
            
            
            let value = 0
            await  cart.forEach(element => {
             value += element.productprice * element.totaladded;
             
            });
            
            
            
            res.json({cart,value})
        } catch (error) {
            res.status(500).send("internal errror")
        }
       
})

Router.delete ('/deletecart/:id',middle,async(req,res)=>{
    
       
            
       try {
        
         const cart = await cartmodule.findById(req.params.id)  
         if(!cart){return res.status(404).send("not found")}
        if(cart.user.toString()!== req.user.id){
            return res.status(401).send("not allowed")
        }
        let newcart = await cartmodule.findByIdAndDelete(req.params.id)
        res.json({"success":"note has been deleted"})
        
    } catch (error) {
        
        res.json({"failed":"note has note been deleted"})
    }
})


Router.delete ('/deleteallcart',middle,async(req,res)=>{          
     let id = req.user.id
        
        try {
            
            const cart = await cartmodule.find({user:id})  
             if(!cart){return res.status(404).send("not found")}
            
            cartmodule.deleteMany(id)
            let catogary =  await cartmodule.updateMany( {user:id} ,{$set:[]},
                {new:true}
                ); 
                
                res.json({"success":"note has been deleted"})
            } catch (error) {
                res.status(500).send("internal errror")
            }
        
   
})



Router.put ('/removetocart/:id',middle,async(req,res)=>{
    
    const cartid = req.params.id
  
 try {
    
 
    const checkcart2 = await cartmodule.findById( cartid)
    
    if(checkcart2.user.toString()!== req.user.id){
        return res.status(401).send("not allowed")
    }
    
    if(checkcart2){
         let newadd = await checkcart2.totaladded - 1
        if(newadd <= 0){
             return res.status(201).send("this product is remove11 from cart")
        }
        else{

             let catogary =  await cartmodule.findOneAndUpdate( checkcart2._id ,{totaladded:newadd},
                {new:true}
                ); 
                
                return res.status(201).send("this product is remove from cart")
            }
    }
 
        
} catch (error) {
    res.status(500).send("internal errror")
}
        
    
   
})




Router.put('/addmorecart/:id',middle,async(req,res)=>{
    
    const cartid = req.params.id
   
 try {
    const checkcart2 = await cartmodule.findById(cartid).populate({
        path: 'productid',
        model: 'Products',
        select: 'quantity'
    })
    console.log(checkcart2)
    const productquantity =  checkcart2.productid?.quantity
    if(checkcart2.user.toString()!== req.user.id){
        return res.status(401).send("not allowed")
    }
     if(checkcart2){
         let newadd = await checkcart2.totaladded + 1
             if(productquantity<newadd){
                return res.status(201).send({success:false})
             }
             else{

                 let catogary =  await cartmodule.findOneAndUpdate( checkcart2._id ,{totaladded:newadd},
                    {new:true}
                    ); 
                }
                
                return res.status(201).send( {success:true})
           }} catch (error) {
            res.status(500).send("internal errror")
}})



Router.get('/checkcart/:id', middle, async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;

    try {
        const foundCartItem = await cartmodule.findOne({ user: userId, productid: productId });

        if (foundCartItem) {
             res.json({ "success": true });
        } else {
             res.json({ "success": false });
        }
    } catch (error) {
        console.error("Error occurred while checking cart:", error);
        res.status(500).json({ "success": false, "error": "Internal server error" });
    }
});





module.exports =Router