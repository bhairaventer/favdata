const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const{body,validationResult} = require("express-validator")
const { default: slugify } = require("slugify")
const isAdmin = require("../middleware/admin")
const productmodule = require("../module/product")
const formidable = require("express-formidable")
const fs = require("fs")
const cartmodule = require("../module/cart")
const ObjectId = require('mongodb').ObjectId;

//size color
Router.get ('/fetchsizecolor/:id',async(req,res)=>{
    let id = req.params.id
  
   
     
    
    try{
        const products = await productmodule.findById(id).populate({ path: 'category', select: 'name' }).select("-photo0").select("-photo1").select("-photo2").select("-photo3").select("-photo")
        let name = products.name
       
        const  formname = await productmodule.find({name}).select("-photo0").select("-photo1").select("-photo2").select("-photo3")
        
        let colorsize = { }
       for(let item of formname){
        if(Object.keys(colorsize).includes(item.color)){
           colorsize[item.color][item.size] = {_id : item._id}
         
        }
        else{
          colorsize[item.color] = {}
          colorsize[item.color][item.size] = {_id : item._id}
          
        }
       }
       res.json({products:JSON.parse(JSON.stringify(products)),colorsize:JSON.parse(JSON.stringify(colorsize))})
         
         
    }
    catch(error){
         res.status(500).send("internal error")
    }
})



//addproduct
 
Router.post("/addproduct",middle,isAdmin,formidable() ,async(req,res)=>{
    let { name, description, price, category, quantity,salediscount, sale,People ,wdprice,color,size,slug} =
    req.fields;
    
    wdprice = price
    if(sale && salediscount){
      
      const discountedAmount = (salediscount / 100) * price;
      const finalAmount = price - discountedAmount;
      price = finalAmount.toFixed(0)
    }
    const { photo0,photo1,photo2,photo3 } = req.files;
    switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is Required" });
        case !People:
          return res.status(500).send({ error: "People is Required" });
        case !size:
          return res.status(500).send({ error: "size is Required" });
        case !slug:
          return res.status(500).send({ error: "slug is Required" });
        case !color:
          return res.status(500).send({ error: "color is Required" });
        case !description:
          return res.status(500).send({ error: "Description is Required" });
        case !price:
          return res.status(500).send({ error: "Price is Required" });
        case !category:
          return res.status(500).send({ error: "Category is Required" });
        case !quantity:
          return res.status(500).send({ error: "Quantity is Required" });
        case photo0 && photo0.size > 1000000:
          return res
            .status(500)
            .send({ error: "photo is Required and should be less then 1mb" });
        case photo1 && photo1.size > 1000000:
          return res
            .status(500)
            .send({ error: "photos is Required and should be less then 1mb" });
        case photo2 && photo2.size > 1000000:
          return res
            .status(500)
            .send({ error: "photos is Required and should be less then 1mb" });
        case photo3 && photo3.size > 1000000:
          return res
            .status(500)
            .send({ error: "photos is Required and should be less then 1mb" });
      }
 
    try{
        
         
        const checkproduct = await productmodule.findOne({ slug });
        if(checkproduct){
            return res.status(200).send({
                success: false,
                message: "product Already Exisits",
              });
        }
        const product1 = new productmodule({
           name, description, price, category,wdprice, quantity,salediscount,People, sale ,color,size,slug,
           review:{reviews : 0 , totalrating: 0} 
          
        })
        if (photo0) {
            product1.photo0.data = fs.readFileSync(photo0.path);
            product1.photo0.contentType = photo0.type;
          }
        if (photo1) {
            product1.photo1.data = fs.readFileSync(photo1.path);
            product1.photo1.contentType = photo1.type;
          }
        if (photo2) {
            product1.photo2.data = fs.readFileSync(photo2.path);
            product1.photo2.contentType = photo2.type;
          }
        if (photo3) {
            product1.photo3.data = fs.readFileSync(photo3.path);
            product1.photo3.contentType = photo3.type;
          }
        const saveproduct = await product1.save()
        res.json(saveproduct)
    } catch (error) {
         res.status(500).send("internal errror")
    }
})

//update notes
Router.put('/updateproduct/:id',middle,isAdmin,formidable(),async(req,res)=>{

    

     let { name, description, price, category,People, quantity,salediscount,wdprice, sale ,color,size,slug} =
    req.fields;
    const { photo0,photo1,photo2,photo3 } = req.files;
       wdprice = price
 

const updateFields = {
  name,
  description,
  price,
  category,
  quantity,
  People,
  wdprice,
  color,
  size,
  slug
};

    if(sale !== 'undefined' && salediscount !== 'undefined'){
       const discountedAmount = (salediscount / 100) * price;
      const finalAmount = price - discountedAmount;
      price =  finalAmount 
       // updateFields.sale = sale;
      // updateFields.salediscount = salediscount;
    }
   

    if( sale == 'undefined'  ){
       
        const item = await productmodule.findByIdAndUpdate(
        req.params.id,
        { $unset: { sale: 1, salediscount: 1 } },
        { new: true } // Set { new: true } to return the updated document
      );
      
    }
 
    

    if ( sale !== 'undefined' &&   salediscount !== 'undefined') {
      updateFields.sale = sale;
      updateFields.salediscount = salediscount;
     }
 
     const products = await productmodule.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    
 
  
    if (photo0) {
    
      products.photo0.data = fs.readFileSync(photo0.path);
      products.photo0.contentType = photo0.type;
    }
    if (photo1) {
      products.photo1.data = fs.readFileSync(photo1.path);
      products.photo1.contentType = photo1.type;
    }
  if (photo2) {
      products.photo2.data = fs.readFileSync(photo2.path);
      products.photo2.contentType = photo2.type;
    }
  if (photo3) {
      products.photo3.data = fs.readFileSync(photo3.path);
      products.photo3.contentType = photo3.type;
    }

    

    await products.save();


    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  
 
   
})


Router.delete("/deleteproduct/:id",middle,isAdmin,async(req,res)=>{
    try {
    
    let product = await  productmodule.findById( req.params.id).select("-photo0").select("-photo1").select("-photo2").select("-photo3");
    if(!product){return res.status(404).send("not found")}
     
    product =await productmodule.findByIdAndDelete(req.params.id)
    res.json({"success":"category has been deleted",product})
      
  } catch (error) {
      
  }
})
module.exports =Router

Router.get("/getphoto/:id",async(req,res)=>{
  try {
    const product = await productmodule.findById(req.params.id).select("photo0").select("photo")
    if (product.photo0.data ) {
      res.set("Content-type", product.photo0.contentType);
      return res.status(200).send(product.photo0.data );
    }
    
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
})

Router.get("/getphoto1/:id",async(req,res)=>{
  try {
    const product = await productmodule.findById(req.params.id).select("photo1");
    if (product.photo1.data ) {
      res.set("Content-type", product.photo1.contentType);
      return res.status(200).send(product.photo1.data );
    }
    
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
})
Router.get("/getphoto2/:id",async(req,res)=>{
  try {
    const product = await productmodule.findById(req.params.id).select("photo2");
    if (product.photo2.data ) {
      res.set("Content-type", product.photo2.contentType);
      return res.status(200).send(product.photo2.data );
    }
    
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
})
Router.get("/getphoto3/:id",async(req,res)=>{
  try {
    const product = await productmodule.findById(req.params.id).select("photo3");
    if (product.photo3.data ) {
      res.set("Content-type", product.photo3.contentType);
      return res.status(200).send(product.photo3.data );
    }
    
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
})



Router.get ('/fetchproductforadmin/:page',async(req,res)=>{
   
 
  const perPage = 10
  const page = req.params.page ? req.params.page : 1;
 

  const {color,size,price,People,category,keyword} = req.query
 
     let args = {};
     if (color ) args.color ={$in:color};
     if (People ) args.People ={$in:People};
     if (category ) args.category = new ObjectId(category)
     if (size ) args.size = {$in:size}
     if (price ) args.price = {$gte: parseInt(price[0]),$lte:parseInt(price[1])}
     if (keyword) args.name =   { $regex: keyword, $options: "i" } 
     if (keyword) args.description =   { $regex: keyword, $options: "i" } 
      
          
 
   
  const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder && req.query.sortOrder === 'desc' ? -1 : 1;

try {
  

  const pipeline = [
    { $match:   args},   
    { $skip: (page - 1) * perPage },
    { $limit: perPage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $project: {
        'category.categoryphoto': 0,
        'category.photo': 0,
        'category.subcategories': 0,
        'category.__v': 0,
        __v: 0,
        photo0: 0,
        photo1: 0,
        photo2: 0,
        photo3: 0,
        photo: 0,
      },
    },
  ];


      const product = await productmodule.aggregate(pipeline).sort({[sortField]: sortOrder})
 
      const products = await productmodule.find({ sale: { $exists: false } }).select('color').select('size')
       
   
       
      let uniqueColors = Array.from(new Set(products.map(item => item.color)));

    res.status(200).send(
      {
product,
        uniqueColors  
      }

        
    );
  } catch (error) {
  
  }
  
})















//for home new product
Router.get ('/fetchlastproduct/:page',async(req,res)=>{
   
 
  const perPage = 10
  const page = req.params.page ? req.params.page : 1;
 

  const {color,size,price,People,category,keyword} = req.query
 
     let args = {};
     if (color ) args.color ={$in:color};
     if (People ) args.People ={$in:People};
     if (category ) args.category = new ObjectId(category)
     if (size ) args.size = {$in:size}
     if (price ) args.price = {$gte: parseInt(price[0]),$lte:parseInt(price[1])}
     if (keyword) args.name =   { $regex: keyword, $options: "i" } 
     if (keyword) args.description =   { $regex: keyword, $options: "i" } 
      
          
    
  const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder && req.query.sortOrder === 'desc' ? -1 : 1;

try {
  

  const pipeline = [
    { $match: { sale: { $exists: false } } },
    { $match:   args},   
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $skip: (page - 1) * perPage },
    { $limit: perPage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $project: {
        'category.categoryphoto': 0,
        'category.photo': 0,
        'category.subcategories': 0,
        'category.__v': 0,
        __v: 0,
        photo0: 0,
        photo1: 0,
        photo2: 0,
        photo3: 0,
        photo: 0,
      },
    },
  ];


      const product = await productmodule.aggregate(pipeline).sort({[sortField]: sortOrder})
 
      const products = await productmodule.find({ sale: { $exists: false } }).select('color').select('size')
       
   
       
      let uniqueColors = Array.from(new Set(products.map(item => item.color)));

    res.status(200).send(
      {
product,
        uniqueColors  
      }

        
    );
       
  } catch (error) {
  
  }
})





 





Router.get ('/fetchsaleproduct/:page',async(req,res)=>{


   const perPage = 10;
  const page = req.params.page ? req.params.page : 1;
try {
  


  const {color,size,price,People,sale} = req.query
   let args = {};
  if (color ) args.color ={$in:color};
  if (People ) args.People ={$in:People};
  if (size ) args.size = {$in:size}
  if (sale ) args.sale = new ObjectId(sale)
  
  if (price ) args.price = {$gte: parseInt(price[0]),$lte:parseInt(price[1])}
 


  const sortField = req.query.sortField || 'createdAt';
  const sortOrder = req.query.sortOrder && req.query.sortOrder === 'desc' ? -1 : 1;
 

  const pipeline = [
    { $match: { sale: { $exists: true } } },
    { $match:   args },
    { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
    { $skip: (page - 1) * perPage },
    { $limit: perPage },
    { $replaceRoot: { newRoot: '$doc' } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $project: {
        'category.categoryphoto': 0,
        'category.photo': 0,
        'category.subcategories': 0,
        'category.__v': 0,
        __v: 0,
        photo0: 0,
        photo1: 0,
        photo2: 0,
        photo3: 0,
        photo: 0,
      },
    },
  ];


     
   
  const product = await productmodule.aggregate(pipeline).sort({[sortField]: sortOrder})

  const products = await productmodule.find({ sale: { $exists: true },sale:sale }).select('color').select('size')
       
  
  
       
  let uniqueColors = Array.from(new Set(products.map(item => item.color)));
 

res.status(200).send(
   {product,uniqueColors}
  
);
} catch (error) {
  
}

})







 

 


 




Router.get('/totalproduct', async (req, res) => {


  const {color,size,price,People,category} = req.query
      let args = {};
     if (color ) args.color ={$in:color};
     if (People ) args.People ={$in:People};
     if (category ) args.category = new ObjectId(category)
     if (size ) args.size = {$in:size}
     if (price ) args.price = {$gte: parseInt(price[0]),$lte:parseInt(price[1])}
 

  try {
    const pipeline = [
      
      { $match:   args},   
  
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $project: {
          'category.categoryphoto': 0,
          'category.photo': 0,
          'category.subcategories': 0,
          'category.__v': 0,
          __v: 0,
          photo0: 0,
          photo1: 0,
          photo2: 0,
          photo3: 0,
          photo: 0,
        },
      },
      
    ];
    const uniqueProductNames = await productmodule.aggregate(pipeline)
    
    
    const uniqueProductNamesCount = uniqueProductNames.length;
 
    res.status(200).send({
      success: true,
      uniqueProductNamesCount,
    });
  } catch (error) {
     res.status(400).send({
      message: "Error in counting unique product names",
      error,
      success: false,
    });
  }
});


Router.get('/uniqueproductnamescount', async (req, res) => {


  const {color,size,price,People,category} = req.query
      let args = {};
     if (color ) args.color ={$in:color};
     if (People ) args.People ={$in:People};
     if (category ) args.category = new ObjectId(category)
     if (size ) args.size = {$in:size}
     if (price ) args.price = {$gte: parseInt(price[0]),$lte:parseInt(price[1])}
 

  try {
    const pipeline = [
      { $match: { sale: { $exists: false } } },
      { $match:   args},   
      { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $project: {
          'category.categoryphoto': 0,
          'category.photo': 0,
          'category.subcategories': 0,
          'category.__v': 0,
          __v: 0,
          photo0: 0,
          photo1: 0,
          photo2: 0,
          photo3: 0,
          photo: 0,
        },
      },
      
    ];
    const uniqueProductNames = await productmodule.aggregate(pipeline)
    
    
    const uniqueProductNamesCount = uniqueProductNames.length;
 
    res.status(200).send({
      success: true,
      uniqueProductNamesCount,
    });
  } catch (error) {
     res.status(400).send({
      message: "Error in counting unique product names",
      error,
      success: false,
    });
  }
});


Router.get ('/totalsaleproduct', async (req, res) => {



  
  const {color,size,price,People,category,sale} = req.query
      let args = {};
     if (color ) args.color ={$in:color};
     if (People ) args.People ={$in:People};
     if (sale ) args.sale = new ObjectId(sale)
     if (category ) args.category = new ObjectId(category)
     if (size ) args.size = {$in:size}
     if (price ) args.price = {$gte: parseInt(price[0]),$lte:parseInt(price[1])}
 
  try {

    const pipeline = [
      { $match: { sale: { $exists: true } } },
      { $match:   args},   
      { $group: { _id: '$name', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $project: {
          'category.categoryphoto': 0,
          'category.photo': 0,
          'category.subcategories': 0,
          'category.__v': 0,
          __v: 0,
          photo0: 0,
          photo1: 0,
          photo2: 0,
          photo3: 0,
          photo: 0,
        },
      },
      
    ]; 

    const sale = await productmodule.aggregate(pipeline)
    const total = sale.length;
     res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
     res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
})

 