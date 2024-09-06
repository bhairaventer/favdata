const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const Admin = require('../middleware/admin')
const ordermodule = require('../module/order')
const formidable = require("express-formidable")
const productmodule = require("../module/product")
const combomodule = require("../module/comboproduct")
const Platformmodule = require("../module/platform")
 const { addDays } = require('date-fns');
  

 



//admin orders


Router.get('/fetchallordersforadmin/:pstatus/:page',middle, async (req, res) => {
  const statusParam = req.params.pstatus;
  const page = parseInt(req.params.page, 10) || 1; // Parse page number from URL params
  const perPage = 10; // Number of orders per page

  // Determine if status is a comma-separated list or a single status
  const statusArray = statusParam.split(',').map(s => s.trim()).filter(s => s.length > 0);

  // Build query args based on status
  const args = statusArray.length ? { status: { $in: statusArray } } : {};

  try {
      // Fetch orders with pagination and filtering
      const orders = await ordermodule.find(args)
          .populate({
              path: 'Platform',
              model: 'Platform',
              select: '-password'
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage);

      // Get total count for pagination
      const totalCount = await ordermodule.countDocuments(args);

      res.json({ totalOrder: totalCount, orders });
  } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Internal server error");
  }
});





Router.get ('/fetchorderforadmin/:id',middle,async(req,res)=>{
    try{
        const order = await ordermodule.findById(req.params.id).sort({ createdAt: -1 }).populate({
            path: 'Platform',
            model: 'Platform',
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

    const {Platform, OrderId, Product, Quntity, TransferPrice, SalesAmount ,Tax,orderdate ,Paymentmode ,Address, Pincode, State,status, MobNo, Dispatchbydate} = req.body;
      try {
        
  
    switch (true) {
       
        case !Platform:
            
          return res.status(500).send({ error: "address is Required" });
        case !OrderId:
            
          return res.status(500).send({ error: "orderid is Required" });
        case !Product:
            
          return res.status(500).send({ error: "products is Required" });
        case !Quntity:
            
              return res.status(500).send({ error: "paymentinfo is Required" });
        case !TransferPrice:
           
              return res.status(500).send({ error: "status is Required" });
        case !SalesAmount:
            
              return res.status(500).send({ error: "userdata is Required" });
            
        case !Tax: 
              return res.status(500).send({ error: "amount is Required" });
        case !Paymentmode: 
              return res.status(500).send({ error: "amount is Required" });
        case !Address: 
              return res.status(500).send({ error: "amount is Required" });
        case !Pincode: 
              return res.status(500).send({ error: "amount is Required" });
        case !State: 
              return res.status(500).send({ error: "amount is Required" });
        case !MobNo: 
              return res.status(500).send({ error: "amount is Required" });
        case !Dispatchbydate: 
              return res.status(500).send({ error: "amount is Required" });
            }

            let productdata = [];
            if (Product?.includes("+")) {

 
              try {
                  const saleData = await combomodule.findOne({ name: Product });
          
           
                  for (const element of saleData.products) {
           
                      // Fetch current sales data
                      const productSaleData = await productmodule.findById(element ).select("ordercome name");
 
                      if (productSaleData) {
                        let productEntry = { _id: productSaleData._id, name: productSaleData.name };
                        productdata.push(productEntry);
                          // Update the sales count
                          await productmodule.findByIdAndUpdate(
                               element ,
                              { ordercome: parseInt(productSaleData.ordercome) +parseInt(Quntity) }
                          );
                      } else {
                       }
                  }
              } catch (error) {
                  console.error("Error updating sales data", error);
              }
          }
          else{
          const saleData = await productmodule.findOne({name:Product}).select("ordercome name")
          productdata.push({ _id: saleData._id, name: saleData.name });

           await productmodule.findOneAndUpdate(
          {name:Product} ,
          {ordercome:  parseInt(saleData.ordercome) +  parseInt(Quntity)},
          );   
          
          }
    
   
    
    
    try{
          
        const order = new ordermodule({
            Platform,productdata, OrderId, Product, Quntity, TransferPrice, Salesamount:SalesAmount ,orderdate,Tax ,Paymentmode ,Address, Pincode, State, MobNo, Dispatchbydate ,status
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




// multi data addd



Router.post('/addmultiorders', middle, async (req, res) => {
  const orders = req.body; // Expecting an array of order objects
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).send({ error: "No orders provided" });
  }

       for (const orderData of orders) {
          const {
              
              status,
              MobNo,
              Platform,
              OrderId,
              Product,
              Quntity,
              TransferPrice,
              Salesamount,
              Tax,
              Paymentmode,
              Address,
              Pincode,
               State,
              Productserial,
              returnserial,
               Condition,
              shippingcharge,
              refundCondition,
              refunddate,
              shipdate,
               OFDdate,
              DTOdate,
              courier,
              Billno,
              Billdate,
              orderdate,
              Lrno,
              trackingnumber,
              claimstatus,
              Dispatchbydate,
              claimapplied,
              claimamount,
              claimrequired,
              Realisablevalue,
              claimdate,
              Lostdate,
              returndate,
              ReceivedDate
           } = orderData;

          // Validate required fields
          // if (!Platform || !OrderId || !Product || !Quntity || !TransferPrice || !SalesAmount || !Tax || !Paymentmode || !Address || !Pincode || !State || !MobNo || !Dispatchbydate) {
          //     return res.status(400).send({ error: "Missing required fields in order data" });
          // }

          let productdata = [];
           if (Product?.includes("+")) {
           
                  const saleData = await combomodule.findOne({ name: Product });
                   if (saleData) {
                      for (const element of saleData.products) {
 
                          // Fetch current sales data
                          const productSaleData = await productmodule.findById(element).select("ordercome name");
                          if (productSaleData) {
                              let productEntry = { _id: productSaleData._id, name: productSaleData.name };
                              productdata.push(productEntry);

                              // Update the sales count
                              await productmodule.findByIdAndUpdate(
                                  element,
                                  { $inc: { ordercome: parseInt(Quntity) } }
                              );
                          } else {
                              //console.log(`Product ${element} not found`);
                          }
                      }
                  } else {
                      //console.log(`Combo ${Product} not found`);
                  }
               
          } else {
            
                  const saleData = await productmodule.findOne({ name: Product }).select("ordercome name");
                  if (saleData) {
                      productdata.push({ _id: saleData._id, name: saleData.name });

                       await productmodule.findOneAndUpdate(
                          { name: Product },
                          { $inc: { ordercome: parseInt(Quntity) } }
                      );
                  } else {
                      //console.log(`Product ${Product} not found`);
                  }
               
          }

          // Create and save the order
    


          
              const order = new ordermodule({
                  Platform,
                  productdata,
                  OrderId,
                  Product,
                  Quntity,
                  TransferPrice,
                  Salesamount,
                  orderdate,
                  Productserial,
                  returnserial,
                   Condition,
                  shippingcharge,
                  refundCondition,
                  refunddate,
                  shipdate,
                   OFDdate,
                  DTOdate,
                  courier,
                  Billno,
                  Billdate,
                  Tax,
                  Lrno,
                  trackingnumber,
                  claimstatus,
                  claimapplied,
                  claimamount,
                  claimrequired,
                  Realisablevalue,
                  claimdate,
                  Lostdate,
                  returndate,
                  ReceivedDate,
                  Paymentmode,
                  Address,
                  Pincode,
                  State,
                  MobNo,
                  Dispatchbydate,
                  status
              });
               const savedOrder = await order.save();
           
      }

      res.status(201).send({ success: true, message: "Orders processed successfully" });

  
});







//update order
Router.put("/updateorder/:id",middle, async (req, res) => {
    const { id } = req.params;
  
  const { Platform, OrderId, Product,courier,claimrequired,claimapplied, Quntity,claimdate,Condition,claimstatus,claimamount, TransferPrice, SalesAmount, Tax, orderdate, Paymentmode, Address, Pincode, State, status, MobNo, Dispatchbydate } = req.body;
     const updateData = {};

   


     if (Platform !== undefined && Platform !== "") updateData.Platform = Platform;
    if (Condition !== undefined && Condition !== "") updateData.Condition = Condition;
    if (OrderId !== undefined) updateData.OrderId = OrderId;
    if (courier !== undefined) updateData.courier = courier;
    if (Product !== undefined) updateData.Product = Product;
    if (Quntity !== undefined) updateData.Quntity = Quntity;
    if (TransferPrice !== undefined) updateData.TransferPrice = TransferPrice;
    if (SalesAmount !== undefined) updateData.SalesAmount = SalesAmount;
    if (Tax !== undefined) updateData.Tax = Tax;
    if (orderdate !== undefined) updateData.orderdate = orderdate;
    if (Paymentmode !== undefined) updateData.Paymentmode = Paymentmode;
    if (Address !== undefined) updateData.Address = Address;
    if (Pincode !== undefined) updateData.Pincode = Pincode;
    if (State !== undefined) updateData.State = State;
    if (status !== undefined) updateData.status = status;
    if (MobNo !== undefined) updateData.MobNo = MobNo;
    if (Dispatchbydate !== undefined) updateData.Dispatchbydate = Dispatchbydate;
    if (claimrequired !== undefined) updateData.claimrequired = claimrequired;
    if (claimapplied !== undefined) updateData.claimapplied = claimapplied;
    if (claimstatus !== undefined) updateData.claimstatus = claimstatus;
    if (claimamount !== undefined) updateData.claimamount = claimamount;
    if (claimdate !== undefined) updateData.claimdate = claimdate;

 
        const updatedOrder = await ordermodule.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedOrder) {
            return res.status(404).send({ error: "Order not found" });
        }
         res.json(updatedOrder);
   
});







//delete api
Router.delete("/deleteorder/:id",middle, async (req, res) => {
  const { id } = req.params;
   try {
      const deletedOrder = await ordermodule.findByIdAndDelete(id);

      if (!deletedOrder) {
          return res.status(404).send({ error: "Order not found" });
      }

      res.status(200).send({ message: "Order deleted successfully" });
  } catch (error) {
       res.status(500).send("Internal server error");
  }
});


//top5 state 


Router.get('/top5states',middle, async (req, res) => {
    try {
      const top5States = await ordermodule.aggregate([
        {
          $group: {
            _id: "$State",
            totalOrders: { $sum: 1 }
          }
        },
        {
          $sort: { totalOrders: -1 }
        },
        {
          $limit: 5
        }
      ]);
  
      res.json(top5States);
    } catch (error) {
       res.status(500).send('Server Error');
    }
  });

//top 5 pincode RTO DTO




Router.get('/top5pincode/rto-dto',middle, async (req, res) => {
    try {
      const top5RTOpincode = await ordermodule.aggregate([
        { $match: { status: 'RTO' } }, // Filter orders with RTO status
        {
          $group: {
            _id: "$Pincode",
            totalRTO: { $sum: 1 }
          }
        },
        {
          $sort: { totalRTO: -1 }
        },
        {
          $limit: 5
        }
      ]);
  
      const top5DTOpincode = await ordermodule.aggregate([
        { $match: { status: 'DTO' } }, // Filter orders with DTO status
        {
          $group: {
            _id: "$Pincode",
            totalDTO: { $sum: 1 }
          }
        },
        {
          $sort: { totalDTO: -1 }
        },
        {
          $limit: 5
        }
      ]);
  
      res.json({ top5RTOpincode, top5DTOpincode });
    } catch (error) {
       res.status(500).send('Server Error');
    }
  });
  
//total for dashbord

Router.get('/totalorders',middle, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Convert startDate and endDate to Date objects if provided
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Default date filter for the entire date range
    const matchFilter = dateFilter.$gte || dateFilter.$lte ? { createdAt: dateFilter } : {};

    // Aggregation to get total orders and total amount
    const result = await ordermodule.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: { $toDouble: "$Salesamount" } }  // Replace "$amount" with the actual field name for order amounts
        }
      }
    ]);
    
    const totalOrders = result[0]?.totalOrders || 0;
    const totalOrder =  await ordermodule.countDocuments({})
    const totalAmount = result[0]?.totalAmount || 0; 

    // Aggregation to get total canceled orders and amount
    const cancelresult = await ordermodule.aggregate([
      {
        $match: { status: "Cancel", ...matchFilter }
      },
      {
        $group: {
          _id: null,
          totalCancelOrders: { $sum: 1 },
          totalCancelAmount: { $sum: { $toDouble: "$Salesamount" } }  // Convert to double if Salesamount is stored as string
        }
      }
    ]);

    // Aggregation to get total return orders and amount
    const returnresult = await ordermodule.aggregate([
      {
        $match: { refundCondition: "YES", ...matchFilter }
      },
      {
        $group: {
          _id: null,
          totalreturnOrders: { $sum: 1 },
          totalreturnAmount: { $sum: { $toDouble: "$Salesamount" } }  // Convert to double if Salesamount is stored as string
        }
      }
    ]);

    const totalCancelCount = cancelresult[0]?.totalCancelOrders || 0;
    const totalretrunCount = returnresult[0]?.totalreturnOrders || 0;
    const totalCancelamount = cancelresult[0]?.totalCancelAmount || 0;
    const totalreturnamount = returnresult[0]?.totalreturnAmount || 0;

    // Count documents for different statuses
    const InTransit = await ordermodule.countDocuments({ status: "Shipped" });
    const Delivered = await ordermodule.countDocuments({ status: "Delivered" });
    const RTO = await ordermodule.countDocuments({ status: "RTO"});
    const DTO = await ordermodule.countDocuments({ status: "DTO", });
    const OFD = await ordermodule.countDocuments({ status: "OFD", });

    // Aggregation for Unshipped orders
    let Unshipped = await ordermodule.aggregate([
      {
        $match: { status: { $in: ["Pendingrtd", "neworder", "RTD"] }, }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 }  
        }
      }
    ]);
    Unshipped = Unshipped[0]?.total || 0;

    // Calculate net values
    const netproced = totalOrders - totalCancelCount;
    const netprocedamount = totalAmount - totalCancelamount;
    const netsale = netproced - totalretrunCount;
    const netsaleamount = netprocedamount - totalreturnamount;

    res.json({
      netsale,
      netsaleamount,
      totalreturnamount,
      totalretrunCount,
      totalOrders,
      totalOrder,
      totalAmount,
      totalCancelCount,
      totalCancelamount,
      netproced,
      netprocedamount,
      Unshipped,
      InTransit,
      OFD,
      Delivered,
      RTO,
      DTO
    });
  } catch (error) {
     res.status(500).json({ error: 'Internal Server Error' });
  }
});






//order status
Router.put('/orderstatus/:id', async (req, res) => {
  const orderId = req.params.id;
  const productdata = req.body.productdata;
  const newinfo = req.body.status;
  




   try {
      let order = await ordermodule.findById(orderId);
     
      if (!order) {
          return res.status(404).send("notfound");
      }

      let updateData = { status: newinfo };

      if (productdata) {
          if (productdata?.billno) updateData.Billno = productdata.billno.toString();
          if (productdata?.orderdate) updateData.orderdate = productdata.orderdate.toString();
          if (productdata?.LRNO) updateData.Lrno = productdata.LRNO.toString();
          if (productdata?.shippingcharges) updateData.shippingcharge = productdata.shippingcharges.toString();
          if (productdata?.Trackingid) updateData.trackingnumber = productdata.Trackingid.toString();
          if (productdata?.Courier) updateData.courier = productdata.Courier.toString();
          if (productdata?.SerialremoveArray) updateData.Productserial = productdata.SerialremoveArray 
          if (productdata?.serialNumbers) updateData.returnserial = productdata.serialNumbers 
          if (productdata?.Deliverybydate) updateData.Deliverybydate = productdata.Deliverybydate.toString();
          if (productdata?.refundCondition) updateData.refundCondition = productdata.refundCondition.toString();
          if (productdata?.Condition) updateData.Condition = productdata.Condition.toString();
          if (productdata?.Realisablevalue) updateData.Realisablevalue = productdata.Realisablevalue.toString();
          if (productdata?.claimrequired) updateData.claimrequired = productdata.claimrequired.toString();
          if (productdata?.claimapplied) updateData.claimapplied = productdata.claimapplied.toString();
          if (productdata?.claimstatus) updateData.claimstatus = productdata.claimstatus.toString();
          if (productdata?.claimamount) updateData.claimamount = productdata.claimamount.toString();
          if (productdata?.claimdate) updateData.claimdate = productdata.claimdate.toString();
      }

      if (newinfo === "OFD" ) {
        updateData.OFDdate = new Date();
      }
      if (newinfo === "Shipped" ) {
        updateData.shipdate = new Date();
      }
      if (newinfo === "Claim" ) {
        updateData.claimdate = new Date();
      }
      if (newinfo === "Lost" ) {
        updateData.Lostdate = new Date();
      }
      if (newinfo === "DTO" ) {
        updateData.DTOdate = new Date();
      }
      if (newinfo === "RTO" ) {
        updateData.returndate = new Date();
      }
      if (newinfo === "Received" ) {
        updateData.ReceivedDate = new Date();
      }
      if (productdata?.refundCondition == "YES" || productdata?.refundCondition == "NO") {
        updateData.refunddate = new Date();
      }
      

 
 if(newinfo === "shipped" ||newinfo == "Not Sent" || newinfo == "Cancel"){
  if (order?.Product?.includes("+")) {

 
    try {
        const saleData = await combomodule.findOne({ name: order?.Product });

 
        for (const element of saleData.products) {
 
            // Fetch current sales data
            const productSaleData = await productmodule.findById(element ).select("ordercome");

            if (productSaleData) {
                // Update the sales count
                await productmodule.findByIdAndUpdate(
                     element ,
                    { ordercome: parseInt(productSaleData.ordercome) - parseInt(order?.Quntity) }
                );
            } else {
             }
        }
    } catch (error) {
        console.error("Error updating sales data", error);
    }
}
else{
const saleData = await productmodule.findOne({name:order?.Product}).select("ordercome")
 await productmodule.findOneAndUpdate(
{name:order?.Product} ,
{ordercome:  parseInt(saleData.ordercome) -  parseInt(order?.Quntity)},
);   

}
 }



 if(newinfo === "Shipped"){
  if (order?.Product?.includes("+")) {

 
    try {
        const saleData = await combomodule.findOne({ name: order?.Product });

 
        for (const element of saleData.products) {
 
            // Fetch current sales data
            const productSaleData = await productmodule.findById(element ).select("totalsale");

            if (productSaleData) {
                // Update the sales count
                await productmodule.findByIdAndUpdate(
                     element ,
                    { totalsale: parseInt(productSaleData.totalsale) + parseInt(order?.Quntity) }
                );
            } else {
                //console.log(`Product ${element} not found`);
            }
        }
    } catch (error) {
        console.error("Error updating sales data", error);
    }
}
else{
const saleData = await productmodule.findOne({name:order?.Product}).select("totalsale")
  await productmodule.findOneAndUpdate(
{name:order?.Product} ,
{totalsale:  parseInt(saleData.totalsale) +  parseInt(order?.Quntity)},
);   

}
 }




if(newinfo === "RTD"){


if(order.Product.includes("+")){
  const saleData = await combomodule.findOne({ name: order?.Product });
  if(saleData.Serialrequired == "NO"){

     order = await ordermodule.findByIdAndUpdate(orderId, updateData, { new: true });
     return
  }

}else{
  const proData = await productmodule.findOne({ name: order?.Product });
  if(proData.Serialrequired == "NO"){

    order = await ordermodule.findByIdAndUpdate(orderId, updateData, { new: true });
    return
 }
 }
 if(!updateData?.Productserial){
  order = await ordermodule.findByIdAndUpdate(orderId, updateData, { new: true });
  return
 }
 


 

const convertNestedObject = (nestedArray) => {
  const result = [];

  nestedArray.forEach(obj => {
    for (const [key, value] of Object.entries(obj)) {
      result.push({
        _id: key,
        items: value
      });
    }
  });

  return result;
};

const convertedArray = convertNestedObject(updateData.Productserial);
 





  for (const element of convertedArray) {
       // Fetch current sales data
    const productSaleData = await productmodule.findById( element._id ).select("serialNumbers");
     let elementsToRemove =  element.items
    const productValues = productSaleData.serialNumbers
  
let filteredArray = productValues.filter(item => !elementsToRemove.includes(item));

  

    if (productSaleData) {
        // Update the sales count
        await productmodule.findByIdAndUpdate(
            { _id: element._id },
            { serialNumbers: filteredArray }
        );
    } else {
     }
}

}
    

      if (newinfo == "Not Sent" || newinfo == "Cancel") {

if(order.status !== "neworder" && order.status !== "Pending RTD"){


        if (order?.Product?.includes("+")) {
          try {
              const saleData = await combomodule.findOne({ name: order?.Product });
       
              for (const element of saleData.products) {
       
                  // Fetch current sales data
                  const productSaleData = await productmodule.findById({_id: element }).select("totalsale");
                   if (productSaleData) {
                      // Update the sales count
                      await productmodule.findByIdAndUpdate(
                          { _id: element },
                          { totalsale: parseInt( productSaleData.totalsale) - parseInt(order?.Quntity) }
                      );
                  } else {
                   }
              }
          } catch (error) {
           }
      }
      else{
      const saleData = await productmodule.findOne({name:order?.Product}).select("totalsale")
       await productmodule.findOneAndUpdate(
      {name:order?.Product} ,
      {totalsale:  parseInt(saleData.totalsale) -  parseInt(order?.Quntity)},
      );   
      
      }

if(order.Productserial){

  const convertNestedObject = (nestedArray) => {
    const result = [];
  
    nestedArray.forEach(obj => {
      for (const [key, value] of Object.entries(obj)) {
        result.push({
          _id: key,
          items: value
        });
      }
    });
  
    return result;
  };
  
  const convertedArray = convertNestedObject(order.Productserial);
      for (const element of convertedArray) {
         
        // Fetch current sales data
        const productSaleData = await productmodule.findById(element._id).select("serialNumbers");
        
        let elementsToadd =  element.items
        const productValues = productSaleData.serialNumbers
      
    let filteredArray = productValues.concat(elementsToadd);
    
      
    
        if (productSaleData) {
            // Update the sales count
            await productmodule.findByIdAndUpdate(
                { _id: element._id },
                { serialNumbers: filteredArray }
            );
        } else {
         }
    }
  }
    }
          
      }




      order = await ordermodule.findByIdAndUpdate(orderId, updateData, { new: true });
      res.json({ order });

  } catch (error) {
       res.status(500).send("An error occurred");
  }
});



//check serialnumber and trackingid
Router.get('/trackingid/:trackingnumber',middle, async (req, res) => {
  const trackingnumber = req.params.trackingnumber;
  let order = []
  try {
    if(req.query.status === "Shipped"){

        order = await ordermodule.findOne({trackingnumber,status:"RTD"});
       }else{
        order = await ordermodule.findOne({trackingnumber,status:"Pending RTD"});
     }
      if(!order){
        return  res.json({ error :"product is not found" ,success :false  })
      }

       if (order.Product.includes("+")) {
       
            const saleData = await combomodule.findOne({ name: order.Product });
     
            const totalProductSaleData = [];

            for (const element of saleData.products) {
         
              // Fetch current sales data
              const productSaleData = await productmodule.findById( element );
               if (productSaleData) {
                // Add the product sale data to the array
                totalProductSaleData.push({
                  product: element,
                  serialNumbers: productSaleData.serialNumbers
                });
              } else {
               }
            }
             res.json({ order, serialNumbers :totalProductSaleData,products:saleData.products ,success :true });

    }
      else{

        let product = await productmodule.findOne({name :order.Product});
         
         
        res.json({ order, serialNumbers :product.serialNumbers, products:[product._id.toString()], success :true });
      }
  } catch (error) {
       res.status(500).send("An error occurred");
  }
});









//state reports 

 

 
 
Router.get('/fetchallstatedetail',middle, async (req, res) => {
  try {
      // Example static filters for state and platform
      const states = [];
      const platforms = []; // List of platform IDs you want to filter by

      // Construct the match stage
      const pipeline = [];

      // Create a match condition
      const matchCondition = {};
      
      if (states.length > 0) {
          matchCondition.State = { $in: states };
      }
      
      if (platforms.length > 0) {
          matchCondition.Platform = { $in: platforms };
      }
      
      // Add the match stage if there are any filters
      if (Object.keys(matchCondition).length > 0) {
          pipeline.push({ $match: matchCondition });
      }

      // Lookup stage to join platforms collection to get platform names
      pipeline.push({
          $lookup: {
              from: 'platforms',
              localField: 'Platform',
              foreignField: '_id',
              as: 'platformDetails'
          }
      });

      // Unwind the platformDetails array to deconstruct it
      pipeline.push({ $unwind: { path: '$platformDetails', preserveNullAndEmptyArrays: true } });

      pipeline.push({
          $group: {
              _id: { State: "$State", Platform: "$platformDetails.name" }, // Group by State and Platform name
              totalSales: { $sum: "$Salesamount" },
              totalSalesQ: { $sum: 1 },
               totalrefund: { 
                  $sum: { 
                      $cond: [{ $eq: ["$refundCondition", "YES"] }, "$Salesamount", 0] 
                  } 
              },
              totalrefundQ: { 
                  $sum: { 
                    $cond: [{ $eq: ["$refundCondition", "YES"] }, 1, 0]
                  } 
              }
          }
      });

      pipeline.push({
          $group: {
              _id: "$_id.State", // Group by State
              platforms: { 
                $push: {
                  Platform: "$_id.Platform",
                  totalSales: "$totalSales",
                   totalrefund: "$totalrefund",
                   totalSalesQ: "$totalSalesQ",
                  totalrefundQ: "$totalrefundQ"
              }
              }
          }
      });

      // Perform aggregation with the constructed pipeline
      const totalSalesByStateAndPlatform = await ordermodule.aggregate(pipeline);

      // Send the response
      res.json(totalSalesByStateAndPlatform);
  } catch (error) {
       res.status(500).send('Server error');
  }
});





//check a product from srialnumber

Router.get('/serialnum/:serial',middle, async (req, res) => {
  const serialNumbers = req.params.serial;
 
  try {
      let product = await productmodule.findOne({serialNumbers}).select("name")
       if(!product){
        return  res.json({ error :"product is not found" ,success :false  })
      }
      res.json({ product});

    }
      
   catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
  }
});





//check refund condsition 


Router.get('/refundcon/:page',middle, async (req, res) => {
  const page = req.params.page; // Defaults to page 1, limit 10 if not provided
  let limit = 20 
  try {
    const skip = (page - 1) * limit;
    const data = await ordermodule.find({ refundCondition: "YES" })
                                  .skip(skip)
                                  .limit(parseInt(limit));
    
    const totalCount = await ordermodule.countDocuments({ refundCondition: "YES" });
 
    if (!data || data.length === 0) {
      return res.json({ error: "No products found", success: false });
    }

    res.json({
      data,
      totalCount
    });
  } catch (error) {
     res.status(500).json({ error: "Internal Server Error", success: false });
  }
});








//fetch sale reports according to platform
Router.get('/fetchfromplaform/:platform',middle,async(req,res)=>{
try{
  const platform = await ordermodule.find({Platform:req.params.platform}).sort({ createdAt: -1 })
    if(!platform){return res.status(404).send("notfound")}
 
  res.json(platform)
}

catch(error){
   res.status(500).send("internal error")
}
})

//fetch sale reports according to State
Router.get('/fetchfromState/:State',middle, async(req,res)=>{
try{
  const State = await ordermodule.find({State:req.params.State}).sort({ createdAt: -1 })
    if(!State){return res.status(404).send("notfound")}
 
  res.json(State)
}

catch(error){
   res.status(500).send("internal error")
}
})




//fetch unique state from order

Router.get ('/unique-states',async(req,res)=>{
   
  
    
 
 try {
  

  const pipeline = [
    { $group: { _id: '$State' } },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 1
      }
    }
  ];



      let statename = await ordermodule.aggregate(pipeline) 
 
       

    res.status(200).send(
      {
        statename,
 
      }

        
    );
       
  } catch (error) {
  
  }
})


//fetch coustmer detail

Router.get('/customerdetail/:page',middle, async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const totalCountPipeline = [
      {
        $group: {
          _id: '$MobNo',
        }
      },
      {
        $count: "totalCount"  // Count the total number of unique MobNo
      }
    ];

    const totalCountResult = await ordermodule.aggregate(totalCountPipeline);
    const totalCount = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const customerDetailsPipeline = [
      {
        $group: {
          _id: '$MobNo',
          Address: { $first: '$Address' },
          Pincode: { $first: '$Pincode' },
          MobNo: { $first: '$MobNo' },
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          MobNo: '$_id',
          Address: 1,
          Pincode: 1,
          MobNo: 1
        }
      }
    ];

    const customerDetail = await ordermodule.aggregate(customerDetailsPipeline);

    res.status(200).send({
      totalCount,
      customerDetail
    });

  } catch (error) {
     res.status(500).send({
      error: 'An error occurred while fetching customer details'
    });
  }
});








//master search 
Router.get('/mastersearch/:page',middle, async (req, res) => {


 
  
  
  
  try {
    const searchTerm = req.query.name;
    const Platform = await Platformmodule.findOne({name:searchTerm})

     const page = req.params.page
    const { startDate, endDate,   } = req.query;
let limit = 20
    const isNumber = !isNaN(Number(searchTerm));

    let query = {
      $or: [
        { Product: searchTerm },
        { State: searchTerm },
        { Platform: Platform?._id },
        { Billno: searchTerm },
        { OrderId: searchTerm },
        { Address: searchTerm },
        { trackingnumber: searchTerm },
        { Lrno: searchTerm },
        { MobNo: searchTerm },
      ]
    };

    if (isNumber) {
      query.$or.push(
        { Pincode: Number(searchTerm) },
        { Salesamount: Number(searchTerm) },
        { returnserial: searchTerm }
      );
    }

    const dateFields = [
      'Dispatchbydate',
      'Deliverybydate',
      'refunddate',
      'shipdate',
      'OFDdate',
      'DTOdate',
      'Billdate',
      'orderdate',
      'claimdate',
      'Lostdate',
      'returndate',
      'ReceivedDate'
    ];

    let dateRangeFilters = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      dateFields.forEach(field => {
        dateRangeFilters[field] = { $gte: start, $lte: end };
      });
    } else if (startDate) {
      const start = new Date(startDate);
      dateFields.forEach(field => {
        dateRangeFilters[field] = { $gte: start };
      });
    } else if (endDate) {
      const end = new Date(endDate);
      dateFields.forEach(field => {
        dateRangeFilters[field] = { $lte: end };
      });
    }

    if (Object.keys(dateRangeFilters).length) {
      query = {
        ...query,
        $or: dateFields.map(field => ({
          [field]: { $gte: dateRangeFilters[field].$gte, $lte: dateRangeFilters[field].$lte }
        }))
      };
    }

    // Calculate the pagination values
    const skip = (page - 1) * limit;

    // Execute the search query with pagination
    const results = await ordermodule.find(query)
      .populate({
        path: 'Platform',
        model: 'Platform',
        select: '-password'
      })
      .skip(skip)
      .limit(Number(limit));

    // Count the total number of documents that match the query
    const totalDocuments = await ordermodule.countDocuments(query);

    // Determine if there are more results to fetch
     res.status(200).send({
      results,
       totalDocuments
    });

  } catch (error) {
     res.status(500).send({
      message: 'An error occurred while searching.',
      error: error.message
    });
  }
});






//// match serial for return rto dto 



Router.post('/matchserialnum',middle, async (req, res) => {
  const serialNumbers =  req.body.serialNumbers;
 console.log(serialNumbers)
  try {
    // Find orders matching the serial numbers
     let orders = await ordermodule.find({
      returnserial: { $in: serialNumbers },
      status: { $in: ["RTO", "DTO"] }
    });
    console.log(orders)
    
    if (orders.length === 0) {
      return res.json({ error: "Orders not found", success: false });
    }
    
    // Function to find keys by values
    const findKeysByValues = (array, targetValues) => {
      const result = [];
      for (const obj of array) {
        for (const [key, values] of Object.entries(obj)) {
          for (const targetValue of targetValues) {
            if (values.includes(targetValue)) {
              result.push({ key, serial: targetValue });
            }
          }
        }
      }
      console.log(result)
      return result;
    };
    
    // Assuming `orders` is an array of documents, each with a `Productserial` property
    let foundKeys = [];
    for (const order of orders) {
      if (order.Productserial) {
        const keys = findKeysByValues(order.Productserial, serialNumbers);
        foundKeys = [...foundKeys, ...keys]; // Merge found keys
      }
    }
    console.log(foundKeys)

     for (const element of foundKeys) {
 
      // Find the product by its ID
      const saleData = await productmodule.findOne({ _id: element.key }).select("serialNumbers totalsale")

    

      const existingSerials = new Set(saleData.serialNumbers);

      // Step 2: Add new serial number
      existingSerials.add(element.serial);
      
      // Convert the Set back to an array
      const updatedSerialsArray = [...existingSerials];
      //console.log(updatedSerialsArray)

      if (saleData) {
        //console.log(saleData.totalsale);

        // Update the totalsale field
        await productmodule.findOneAndUpdate(
          { _id: element.key },
          { 
            $inc: { totalsale: -1 }, // Increment totalsale by 1
            $set: { serialNumbers: Array.from(updatedSerialsArray) } // Update serialNumbers field
          }
        );
        

        //console.log(`Updated totalsale for ${element.key} with serial ${element.serial}`);
      } else {
        console.error(`Product not found for ID ${element.key}`);
      }
    }

    res.json({
      success: true,
      foundKeys
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});




Router.post('/matchproductids',middle, async (req, res) => {
  const productIds = req.body.productIds

  try {
    // Find products matching the provided IDs
    const products = await productmodule.find({ _id: { $in: productIds },status: { $in: ["RTO", "DTO"] } });

    if (products.length === 0) {
      return res.status(404).send({ success: false, message: 'No products found' });
    }

    // Prepare updates
    const updatePromises = products.map(async (product) => {
  //console.log(product.totalsale)

      // Assume we have a mechanism to get the serial number to be updated (e.g., from req.body)
      

      
         await productmodule.findByIdAndUpdate(
          product._id,
          {
            $inc: { totalsale: -1 }, // Decrement totalsale by 1
            
          }
        );
       
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Products updated successfully'
    });

  } catch (error) {
    console.error('Error updating products:', error);
    res.status(500).send({ success: false, message: 'An error occurred while updating products' });
  }
});


 








module.exports =Router




