const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
   const productmodule = require("../module/product")
const combomocudle = require("../module/comboproduct")
 const fs = require("fs")
 const order = require("../module/order")
const purchase = require("../module/purchase")
const ObjectId = require('mongodb').ObjectId;
 





//addproduct
 
Router.post("/addproduct",middle, async(req,res)=>{
    let { name, salingprice,category, Serialrequired,MRP,othername} = req.body;
   

     //console.log(req.body)
    switch (true) {
      case !name:
        return res.status(500).send({ error: 'Name is Required' });
      case !salingprice:
        return res.status(500).send({ error: 'Saling price is Required' });
      case !MRP:
        return res.status(500).send({ error: 'MRP is Required' });
      case !category:
        return res.status(500).send({ error: 'Category is Required' });
    }
    
        const checkproduct = await productmodule.findOne({ name });
        const othername1 = await productmodule.findOne( {othername :othername}).select("othername")
  //console.log(othername1)
        if(checkproduct){
            return res.status(200).send({
                success: false,
                message: "product Already Exisits",
                data:checkproduct

              });
        }

        if(othername1){
          //console.log("yery")
            return res.status(200).send({
                success: false,
                message: "serial Already Exisits",
                data:othername1
              });
        }


        let args = {
          $or: [
            { othername: othername },
            { othername: name },
            { name: othername },
            { name: name }
          ]
        };
    
        const comboothername1 = await combomocudle.findOne(args) ;
         if(comboothername1){ 
          return res.status(200).send({
            success: false,
            message: "serial Already Exisits",
            data:comboothername1
          });
        }    

        const product1 = new productmodule({
           name, salingprice, category ,MRP,othername,Serialrequired
          
        })
       
        const saveproduct = await product1.save()
        res.status(200).send({
          success: true,
          message: "Product Successfully created",
          data:comboothername1
        });    
})


//get top 5 products 





Router.get('/top5products',middle, async(req, res) => {
  try {
    const top5Products = await productmodule.find().sort({ totalsale: -1 }).limit(5);
    res.json(top5Products);
  } catch (error) {
    console.error('Error fetching top 5 products', error);
    res.status(500).send('Server Error');
  }
});



Router.put("/updateproduct/:id",middle, async (req, res) => {
  const { id } = req.params;
  const {name,category,MRP,salingprice,othername } = req.body;
 //console.log(req.body)

  const getproname = await productmodule.findById(id);
  if(name !== undefined){
    const changeOrdername = await order.findOne({Product:getproname?.name});
     const updatedOrder = await order.findOneAndUpdate({Product:getproname?.name}, {Product:name}, { new: true }); 
   }

   const updateData = {};
 

  // Add fields to updateData only if they are defined
  updateData.othername =othername
  if (name !== undefined) updateData.name = name;
  if (category !== undefined) updateData.category = category;
  if (MRP !== undefined) updateData.MRP = MRP;
  if (salingprice !== undefined) updateData.salingprice = salingprice;
  
  
      const updatedOrder = await productmodule.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedOrder) {
          return res.status(404).send({ error: "product not found" });
      }
       res.json(updatedOrder);
 
});


Router.delete("/deleteproduct/:id",middle, async(req,res)=>{
    try {
    
    let product = await  productmodule.findById( req.params.id) 
    console.log(product)
    if(!product){return res.status(404).send("not found")}
    let avinorder = await  order.findOne({Product:product.name}) 
    let purchaseorder = await  purchase.findOne({"name.productid":req.params.id}) 
  if(purchaseorder){return res.status(202).send("you can't delete this product")}
 if(avinorder){return res.status(202).send("you can't delete this product")}
     
    product =await productmodule.findByIdAndDelete(req.params.id)
    res.json({"success":"category has been deleted",product})
      
  } catch (error) {
      
  }
})
module.exports =Router

 
 


Router.get('/fetchproductforadmin/:page', middle, async (req, res) => {
  try {
      const page = parseInt(req.params.page) || 1;
      const limit = 20; // Number of products per page
      const skip = (page - 1) * limit;
       const searchQuery = req.query.search || ''; // Get search query from request
console.log(searchQuery)
      const products = await productmodule.aggregate([
        {
          $addFields: {
            priority: {
              $indexOfArray: [
                [
                  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
                ],
                { $toLower: { $substrCP: ["$name", 0, 1] } }
              ]
            }
          }
        },
        {
          $match: {
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search on the name field
              { MRP: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search on the MRP field
              { salingprice: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search on the MRP field
              { Serialrequired: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search on the MRP field
              { othername: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search on the MRP field
              { instock: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search on the MRP field
            ]
          }
        },        
        { $sort: { priority: 1, name: 1 } }, // Sort by priority first, then by name
        {
          $lookup: {
            from: 'categories', // Collection name in MongoDB
            localField: 'category', // Field in the product documents
            foreignField: '_id', // Field in the category documents
            as: 'category'
          }
        },
        { $skip: skip },
        { $limit: limit }
      ]);

      const totalCount = await productmodule.countDocuments({
        name: { $regex: searchQuery, $options: 'i' } // Ensure totalCount respects the search query
      });

      res.status(200).send({ products, totalCount });
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});




//fetch product by othername 

Router.get('/fetchsingleproduct/:name',middle, async (req, res) => {
  try {
    let othername = req.params.name;
    if(othername == null){ 
      return res.status(200).send({   });
    } 
    let args = {
      $or: [
        { othername: othername },
        { name: othername }
      ]
    };

    const othername1 = await productmodule.findOne(args).select("name").select("Serialrequired");

     if(!othername1){
      return res.status(200).send({   });
    }
    if(othername1 == null){ 
      return res.status(200).send({   });
    } 
    //console.log(othername)
    res.status(200).send({ othername1 });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});



//PRODUCTNAME
Router.get('/productnames',middle, async (req, res) => {
  try {
     

      const products = await productmodule.find({}).select("name").select("othername")
      let array1 = products.map(product => product.name);
      let othername = products.map(product => product.othername);
      let array2 = othername.flat().filter(item => typeof item === 'string');
      let productNames = array1.concat(array2);
         res.status(200).send({ productNames });
  } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});















