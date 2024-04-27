const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const Admin = require('../middleware/admin')
const ordermodule = require('../module/order')
const formidable = require("express-formidable")
const productmodule = require("../module/product")
const cartmodule = require("../module/cart")
const isAdmin = require("../middleware/admin")
const { addDays } = require('date-fns');


//fetchallnotes

Router.get ('/fetchallorders/:page', middle, async (req, res) => {
    try {
        const perPage = 10;
        const page = req.params.page ? parseInt(req.params.page) : 1;

        // Calculate skip value for pagination
        const skip = (page - 1) * perPage;
        
     
        // Query orders using pagination
        const orders = await ordermodule.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage);

        // Send response
        res.json({   orders });
    } catch (error) {
         res.status(500).send("Internal server error");
    }
});

Router.get ('/fetchtotalcountorders', middle, async (req, res) => {
    try {
         
        const totalOrder = await ordermodule.countDocuments({ user: req.user.id });
 
        // Send response
        res.json({  totalOrder });
    } catch (error) {
         res.status(500).send("Internal server error");
    }
});





//admin orders


Router.get ('/fetchallordersforadmin/:pstatus/:page', middle, Admin, async (req, res) => {
    const status = await req.params.pstatus;
 
 
let args = {}
    if (status ) args.status = {$in:status}

    try {
      let data = await status.toString()
        const perPage = 10;
        const page = req.params.page ? parseInt(req.params.page) : 1
    
        const orders = await ordermodule.find(args)
        .sort({ createdAt: -1 }) 
        .skip((page - 1) * perPage)
        .limit(perPage);
        
        const totalCount = await ordermodule.countDocuments( args);
          
        res.json({ totalOrder: totalCount, orders });
    } catch (error) {
         res.status(500).send("Internal server error");
    }
});




Router.get ('/fetchorderforadmin/:id',middle,Admin,async(req,res)=>{
    try{
        const order = await ordermodule.findById(req.params.id).sort({ createdAt: -1 }).populate({
            path: 'user',
            model: 'user',
            select: '-password'
        });
        if(!order){return res.status(404).send("notfound")}
        
        res.json(order)
 
    }

    catch(error){
         res.status(500).send("internal error")
    }
})







Router.get ('/fetchorder/:id',middle,async(req,res)=>{
    try{
        const order = await ordermodule.findById(req.params.id).sort({ createdAt: -1 })
        console.log(order)
         if(!order){return res.status(404).send("notfound")}
        if(order.user.toString()!== req.user.id){
            return res.status(401).send("not allowed")
        }
        res.json(order)
    }
    
    catch(error){
         res.status(500).send("internal error")
    }
})


//addnotes
 
Router.post("/addorders",middle ,async(req,res)=>{

    const {orderid,products,paymentinfo,address,amount,status,userdata} = req.body;
    try {
        
  
    switch (true) {
       
        case !address:
            
          return res.status(500).send({ error: "address is Required" });
        case !orderid:
            
          return res.status(500).send({ error: "orderid is Required" });
        case !products:
            
          return res.status(500).send({ error: "products is Required" });
        case !paymentinfo:
            
              return res.status(500).send({ error: "paymentinfo is Required" });
        case !status:
           
              return res.status(500).send({ error: "status is Required" });
        case !userdata:
            
              return res.status(500).send({ error: "userdata is Required" });
            
        case !amount: 
              return res.status(500).send({ error: "amount is Required" });
            }

    
    products.forEach(async(element) => {
        let orderquantity = element.totaladded
        let  productid =element.productid
        
                const product =  await productmodule.findById(productid).select("quantity")
                if(element.quantity > product.quantity){
                    return res.status(200).send({
                        success : false,
                        massage :"some product is out of stock in your order"
                    })
                }
                if(!product){
                    return  res.status(401).send("not allowed")
                }
              
                await productmodule.findByIdAndUpdate(
                     productid ,
                  {quantity: product.quantity-orderquantity  },
                  );   
 
    });
    
   
    
    
    try{
        
        const order = new ordermodule({
            orderid,products,paymentinfo,address,amount,status,userdata,retunvalid:"",  user:req.user.id
        })
        const saveorder = await order.save()
      
        res.json(saveorder)
    } catch (error) {
         res.status(500).send("internal errror")
    }
} catch (error) {
    res.status(500).send("internal errror")
}
})





//payment status 

  Router.put('/paidstatus/:orderid',middle,async(req,res)=>{
   
    const orderId = req.params.orderid
 
    let newinfo = req.body.paymentinfo;
    
     let order = await ordermodule.findOne({orderid:orderId , user:req.user.id})
    
  
    if(!order){return res.status(404).send("notfound")}
    if(order.user.toString()!== req.user.id){
        return res.status(401).send("not allowed")
    }
if(order.paymentinfo == "pending" || order.paymentinfo == "Faild" ){
    try { 
        order = await ordermodule.findOneAndUpdate({orderid:orderId} ,{paymentinfo:newinfo},
            {new:true})
            
            res.json({order})
     
        } catch (error) { 
         } 
        
    }
})


//order status
  Router.put('/orderstatus/:id',middle,Admin,async(req,res)=>{
   
    const orderId = req.params.id
 
    const newinfo = req.body.status;
    let retunvalid =""
     let order = await ordermodule.findById(orderId)
  
     try {
        
    
    if(!order){return res.status(404).send("notfound")}
    if(newinfo== "Delivered"){
        const currentDate = new Date() 
          retunvalid = addDays(currentDate, 6);
    }
    
     
     if(newinfo == "Refund Completed"){

     

    order.products.forEach(async(element) => {
       let orderquantity = element.totaladded
       let  productid =element.productid
       
               const product =  await productmodule.findById(productid).select("quantity")
               
              
               await productmodule.findByIdAndUpdate(
                    productid ,
                 {quantity: product.quantity+orderquantity  },
                 );   

                
                 
   });}
   
    

    try { 
        order = await ordermodule.findByIdAndUpdate(orderId,{status:newinfo,retunvalid:retunvalid},
            {new:true})
         res.json({order})
        
    } catch (error) { 
     } 
 
} catch (error) {
        
}
 
})




  Router.put('/cancelorder/:id',middle,async(req,res)=>{
   
    const orderId = req.params.id
 
    const newinfo = req.body.status;
     
    
     let order = await ordermodule.findById(orderId)
     
     try { 
     

     order.products.forEach(async(element) => {
        let orderquantity = element.totaladded
        let  productid =element.productid
        
                const product =  await productmodule.findById(productid).select("quantity")
                
               
                await productmodule.findByIdAndUpdate(
                     productid ,
                  {quantity: product.quantity+orderquantity  },
                  );   

               
                  
    });
    


    if(!order){return res.status(404).send("notfound")}
    if(order.user.toString()!== req.user.id){
        return res.status(401).send("not allowed")
    }
    if(order.status !=="Processing"){
        return  res.status(404).send("not allow")
    }

        order = await ordermodule.findByIdAndUpdate(orderId,{status:newinfo},
            {new:true})
 
        res.json({order})
       
    } catch (error) { 
    } 
 
 
 
})




Router.put('/updatetracking/:id',middle,Admin ,async(req,res)=>{
   
    const Id = req.params.id
  
    let newinfo = req.body.trackingnumber;
 

    try { 
        order = await ordermodule.findByIdAndUpdate(Id ,{trackingnumber:newinfo},
            {new:true})
            
            res.json({order})
        } catch (error) { 
         } 
        
    
})











module.exports =Router




