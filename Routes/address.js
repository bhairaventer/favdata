const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const Addressmodule = require('../module/address')
const formidable = require("express-formidable")
//fetchallnotes
Router.get ('/fetchalladdress',middle,async(req,res)=>{
    try{
        const address = await Addressmodule.find({user:req.user.id}).sort({ createdAt: -1 });
        res.json({totaladdress: address.length ,address})
       
    }
    catch(error){
         res.status(500).send("internal error")
    }
})

 


//addnotes
 
Router.post("/addaddress",middle ,async(req,res)=>{
     const {name,address,city,state,pincode,phone} = req.body;
     try {
        
     
    switch (true) {
        case !name:
          return res.status(500).send({ error: "Name is Required" });
        case !address:
          return res.status(500).send({ error: "address is Required" });
        case !city:
          return res.status(500).send({ error: "city is Required" });
        case !state:
          return res.status(500).send({ error: "state is Required" });
        case !phone:
          return res.status(500).send({ error: "phone is Required" });
          case !pincode:
              return res.status(500).send({ error: "pincode is Required" });
            }} catch (error) {
        
            }
    
    try{
        
        const addresh = new Addressmodule({
            name,address,phone,city,state,pincode,user:req.user.id,selected:false
        })
        const saveaddress = await addresh.save()
        res.json(saveaddress)
    } catch (error) {
         res.status(500).send("internal errror")
    }
})




 



//update notes
Router.put('/updateaddress/:id',middle,async(req,res)=>{
    const {name,address,city,state,pincode,phone} = req.body
    try {   
    const newaddress ={};
    if(name){newaddress.name = name}
    if(address){newaddress.address =address}
    if(city){newaddress.city=city}
    if(phone){newaddress.phone=phone}
    if(state){newaddress.state=state}
    if(pincode){newaddress.pincode=pincode}
    let pid = req.params.id
     
    
     let addresh = await Addressmodule.findById(pid)
     
    if(!addresh){return res.status(404).send("notfound")}
    
    if(addresh.user.toString()!== req.user.id){
        return res.status(401).send("not allowed")
    }

  
         
          addresh =  await Addressmodule.findByIdAndUpdate( 
            pid ,{$set:newaddress},
                 {new:true}
            ); 
        res.json({addresh})
    } catch (error) { 
        res.status(500).send("internal errror")
    } 
 
 
 
})


Router.delete("/deleteaddress/:id",middle,async(req,res)=>{
   
   try {
    
   let address = await Addressmodule.findById( req.params.id)
    if(!address){return res.status(404).send("not found")}
    if(address.user.toString()!== req.user.id){
        return res.status(401).send("not allow")
    }
    address =await Addressmodule.findByIdAndDelete(req.params.id)
    res.json({"success":"address has been deleted",address})
} catch (error) {
    res.status(500).send("internal errror")
} 
})
module.exports =Router