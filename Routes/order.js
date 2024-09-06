const express = require("express")
const Router = express.Router()
const middle = require('../middleware/middle')
const Admin = require('../middleware/admin')
const ordermodule = require('../module/order')
const formidable = require("express-formidable")
const productmodule = require("../module/product")
const combomodule = require("../module/comboproduct")
const Platformmodule = require("../module/platform")
const purchasemodule = require("../module/purchase")
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


 


 
Router.post("/addorders", middle, async (req, res) => {
  const {
    Platform, OrderId, Product, Quntity, TransferPrice,
    SalesAmount, Tax, orderdate, Paymentmode,
    Address, Pincode, State, status, MobNo, Dispatchbydate
  } = req.body;

  try {
    // Validate required fields
    switch (true) {
      case !Platform:
        return res.status(500).send({ error: "Platform is Required" });
      case !OrderId:
        return res.status(500).send({ error: "OrderId is Required" });
      case !Product:
        return res.status(500).send({ error: "Product is Required" });
      case !Quntity:
        return res.status(500).send({ error: "Quantity is Required" });
      case !TransferPrice:
        return res.status(500).send({ error: "TransferPrice is Required" });
      case !SalesAmount:
        return res.status(500).send({ error: "SalesAmount is Required" });
      case !Tax:
        return res.status(500).send({ error: "Tax is Required" });
      case !Paymentmode:
        return res.status(500).send({ error: "Paymentmode is Required" });
      case !Address:
        return res.status(500).send({ error: "Address is Required" });
      case !Pincode:
        return res.status(500).send({ error: "Pincode is Required" });
      case !State:
        return res.status(500).send({ error: "State is Required" });
      case !MobNo:
        return res.status(500).send({ error: "MobNo is Required" });
      case !Dispatchbydate:
        return res.status(500).send({ error: "Dispatchbydate is Required" });
    }

 
     // Create the order with the calculated total cost
    const order = new ordermodule({
      Platform, productdata, Product, OrderId, Quntity, TransferPrice,
      Salesamount: SalesAmount, orderdate, Tax, Paymentmode,
      Address, Pincode, State, MobNo, Dispatchbydate, status,
      totalCost:0, affectedPurchases:[] // Include the calculated total cost and affected purchases
    });

    // Save the order to the database
    const saveorder = await order.save();

    res.json(saveorder);
    console.log(saveorder);
  } catch (error) {
    console.error("Error processing the order:", error);
    res.status(500).send("Internal server error");
  }
});


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
                              findByIdAndUpdate(
                                element,
                                { ordercome: parseInt(productSaleData.ordercome) + parseInt(Quntity) }
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
                        { ordercome: parseInt(saleData.ordercome) + parseInt(Quntity) }
                      );

      


              
                     
                  } else {
                      //console.log(`Product ${Product} not found`);
                  }
               
          }

          // Create and save the order
    
          if (remainingQuantity > 0) {
            return res.status(400).send({ error: "Not enough stock available to fulfill the order" });
          }

          
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
                  status,totalCost, affectedPurchases
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
  const { orderId } = req.params;
   try {
    const order = await ordermodule.findById(id);


 
      if(order?.Product?.includes("+")){
        const order = await ordermodule.findById(orderId);
      
        const saleData = await combomodule.findOne({ name: order?.Product });
      
        for (const element of saleData.products) {
            // Fetch current sales data
            const productSaleData = await productmodule.findById({ _id: element }).select("totalsale");
            if (productSaleData) {
                // Update the sales count
                await productmodule.findByIdAndUpdate(
                    { _id: element },
                    { totalsale: parseInt(productSaleData.totalsale) - parseInt(order?.Quntity) }
                );
            }
            if (!order || !order.affectedPurchases) {
              return { status: 404, message: "Order not found or no tracking details available" };
          }
      
          // Iterate through affected purchases to revert the sold quantities
          for (let detail of order.affectedPurchases) {
              const purchase = await purchasemodule.findOne(
                  { _id: detail.purchaseId, "name.productid": detail.productid }
              );
      
              if (purchase) {
                  for (let item of purchase.name) {
                      if (item.productid.toString() === detail.productid.toString()) {
                          // Decrease the sold quantity by the quantity in affectedPurchases
                          item.soldQuantity -= detail.quantity;
      
                          // Update the purchase record in the database
                          await purchasemodule.updateOne(
                              { _id: purchase._id, "name.productid": item.productid },
                              { $set: { "name.$.soldQuantity": item.soldQuantity } }
                          );
                          break; // Exit loop after updating the relevant item
                      }
                  }
              }
          }
      
          // Optionally, remove the affected purchases from the order after reverting the changes
          await ordermodule.updateOne(
              { _id: orderId },
              { $unset: { affectedPurchases: "" } }
          );
      
       
       
      }
      
      }else{
      
      
      
        // Assuming this function is triggered when an order is canceled
       
        // Fetch the order to get tracking details
        const order = await ordermodule.findById(orderId);
      
        if (!order || !order.affectedPurchases) {
            return res.status(404).send({ error: "Order not found or no tracking details available" });
        }
      
        // Iterate through tracked purchases to revert the sold quantities
        for (let detail of order.affectedPurchases) {
            const purchase = await purchasemodule.findOne(
                { _id: detail.purchaseId, "name.productid": detail.productid }
            );
      
            if (purchase) {
                for (let item of purchase.name) {
                    if (item.productid.toString() === detail.productid.toString()) {
                        // Revert the sold quantity
                        item.soldQuantity -= detail.quantity;
      
                        // Update the purchase record in the database
                        await purchasemodule.updateOne(
                            { _id: purchase._id, "name.productid": item.productid },
                            { $set: { "name.$.soldQuantity": item.soldQuantity } }
                        );
                        break;
                    }
                }
            }
        }
      
        // Optionally, remove the tracking details from the order
        await ordermodule.updateOne(
            { _id: orderId },
            { $unset: { affectedPurchases: "" } }
        );
      
      
       
      
             
                }
      
      
      
      
      
                    if (order?.Product?.includes("+")) {
                        try {
                            const saleData = await combomodule.findOne({ name: order?.Product });
      
                            for (const element of saleData.products) {
                                // Fetch current sales data
                                const productSaleData = await productmodule.findById({ _id: element }).select("totalsale");
                                if (productSaleData) {
                                    // Update the sales count
                                    await productmodule.findByIdAndUpdate(
                                        { _id: element },
                                        { totalsale: parseInt(productSaleData.totalsale) - parseInt(order?.Quntity) }
                                    );
                                }
      
                            }
                        } catch (error) {
                            console.error("Error updating sales data", error);
                        }
                    } else {
                        const saleData = await productmodule.findOne({ name: order?.Product }).select("totalsale");
                        await productmodule.findOneAndUpdate(
                            { name: order?.Product },
                            { totalsale: parseInt(saleData.totalsale) - parseInt(order?.Quntity) }
                        );
                    }
      
                    if (order.Productserial) {
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
                            const productSaleData = await productmodule.findById(element._id).select("serialNumbers");
      
                            if (!productSaleData) {
                                console.error(`Product with ID ${element._id} not found.`);
                                continue;
                            }
      
                            const existingSerialNumbers = productSaleData.serialNumbers || [];
                            const elementsToAdd = element.items;
      
                            const serialNumbersMap = new Map();
      
                            existingSerialNumbers.forEach(serialObj => {
                                serialNumbersMap.set(serialObj.serial, serialObj);
                            });
      
                            elementsToAdd.forEach(newSerialObj => {
                                serialNumbersMap.set(newSerialObj.serial, newSerialObj);
                            });
      
                            const updatedSerialNumbers = Array.from(serialNumbersMap.values());
      
                            await productmodule.findByIdAndUpdate(
                                element._id,
                                { serialNumbers: updatedSerialNumbers },
                                { new: true }
                            );
                        }
                    }
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
      const deletedOrder = await ordermodule.findByIdAndDelete(orderId);




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
console.log(orderId,productdata,newinfo)
   
      let order = await ordermodule.findById(orderId);

      if (!order) {
          return res.status(404).send("Order not found");
      }
try {
  

      let updateData = { status: newinfo };

      if (productdata) {
          if (productdata?.billno) updateData.Billno = productdata.billno.toString();
          if (productdata?.orderdate) updateData.orderdate = productdata.orderdate.toString();
          if (productdata?.LRNO) updateData.Lrno = productdata.LRNO.toString();
          if (productdata?.shippingcharges) updateData.shippingcharge = productdata.shippingcharges.toString();
          if (productdata?.Trackingid) updateData.trackingnumber = productdata.Trackingid.toString();
          if (productdata?.Courier) updateData.courier = productdata.Courier.toString();
          if (productdata?.SerialremoveArray) updateData.Productserial = productdata.SerialremoveArray;
          if (productdata?.serialNumbers) updateData.returnserial = productdata.serialNumbers;
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

      if (newinfo === "OFD") {
          updateData.OFDdate = new Date();
      }
      if (newinfo === "Shipped") {
          updateData.shipdate = new Date();
      }
      if (newinfo === "Claim") {
          updateData.claimdate = new Date();
      }
      if (newinfo === "Lost") {
          updateData.Lostdate = new Date();
      }
      if (newinfo === "DTO") {
          updateData.DTOdate = new Date();
      }
      if (newinfo === "RTO") {
          updateData.returndate = new Date();
      }
      if (newinfo === "Received") {
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




        let productdata = [];
        let totalCost = 0;
        const affectedPurchases = [];
  
        if (order?.Product?.includes("+")) {
     
            const saleData = await combomodule.findOne({ name: order?.Product });
            console.log(saleData.products);
         
            for (const element of saleData.products) {
     
              // Fetch current sales data
              const productSaleData = await productmodule.findById(element).select("ordercome name");
    
              if (productSaleData) {
                let productEntry = { _id: productSaleData._id, name: productSaleData.name };
                productdata.push(productEntry);
    
                // Update the sales count
                await productmodule.findByIdAndUpdate(
                  element,
                  { ordercome: parseInt(productSaleData.ordercome) + parseInt(order?.Quntity) }
                );
    
                // Initialize total cost
                let remainingQuantity = order?.Quntity;
    
                // Fetch purchase data for the given product
                const purchaseData = await purchasemodule.find({ "name.productid": element }).sort({ billdate: 1 });
                if (purchaseData.length === 0) {
                  return res.status(404).send({ error: "No purchases found for this product" });
                }
    
                // Iterate through purchases to fulfill the order quantity
                for (let purchase of purchaseData) {
                  for (let item of purchase.name) {
                    if (item.productid.toString() === element.toString()) {
                      // Calculate available quantity in this purchase
                      let availableQuantity = item.quantity - item.soldQuantity;
                      
                      if (availableQuantity > 0) {
                        // Calculate how much can be allocated from this purchase
                        let allocatedQuantity = Math.min(remainingQuantity, availableQuantity);
    
                        // Calculate the cost for this part of the order
                        totalCost += allocatedQuantity * item.rateper;
    
                        // Update the sold quantity in the purchase record
                        item.soldQuantity += allocatedQuantity;
    
                        // Update the purchase record in the database
                        await purchasemodule.updateOne(
                          { _id: purchase._id, "name.productid": item.productid },
                          { $set: { "name.$.soldQuantity": item.soldQuantity } }
                        );
    
                        // Track affected purchase details
                       
    
                        // Decrease the remaining order quantity
                        remainingQuantity -= allocatedQuantity;
                        await affectedPurchases.push({
                          purchaseId: purchase._id,
                          productid: item.productid,
                          quantity: allocatedQuantity
                        });
    
    
                        console.log(affectedPurchases)
                        // If we've fulfilled the order quantity, break out of the loop
                        if (remainingQuantity <= 0) break;
                      }
                    }
                  }
                  if (remainingQuantity <= 0) break; // Stop searching if order is fully allocated
                }
    
                // Check if the entire order quantity was fulfilled
                if (remainingQuantity > 0) {
                  return res.status(400).send({ error: "Not enough stock available to fulfill the order" });
                }
              }
            }
          
        } else {
          const saleData = await productmodule.findOne({ name: order?.Product }).select("ordercome name");
          productdata.push({ _id: saleData._id, name: saleData.name });
    
          await productmodule.findOneAndUpdate(
            { name: order?.Product },
            { ordercome: parseInt(saleData.ordercome) + parseInt(order?.Quntity) }
          );
    
          // Initialize total cost
          let remainingQuantity = order?.Quntity;
    
          // Fetch purchase data for the given product
          const purchaseData = await purchasemodule.find({ "name.productid": saleData._id }).sort({ billdate: 1 });
          if (purchaseData.length === 0) {
            return res.status(404).send({ error: "No purchases found for this product" });
          }
    
          // Iterate through purchases to fulfill the order quantity
          for (let purchase of purchaseData) {
            for (let item of purchase.name) {
              if (item.productid.toString() === saleData._id.toString()) {
                // Calculate available quantity in this purchase
                let availableQuantity = item.quantity - item.soldQuantity;
                
                if (availableQuantity > 0) {
                  // Calculate how much can be allocated from this purchase
                  let allocatedQuantity = Math.min(remainingQuantity, availableQuantity);
    
                  // Calculate the cost for this part of the order
                  totalCost += allocatedQuantity * item.rateper;
    
                  // Update the sold quantity in the purchase record
                  item.soldQuantity += allocatedQuantity;
    
                  // Track affected purchase details
                  await affectedPurchases.push({
                    purchaseId: purchase._id,
                    productid: item.productid,
                    quantity: allocatedQuantity
                  });
    
                  // Update the purchase record in the database
                  await purchasemodule.updateOne(
                    { _id: purchase._id, "name.productid": item.productid },
                    { $set: { "name.$.soldQuantity": item.soldQuantity } }
                  );
    
                  // Decrease the remaining order quantity
                  remainingQuantity -= allocatedQuantity;
    
                  // If we've fulfilled the order quantity, break out of the loop
                  if (remainingQuantity <= 0) break;
                }
              }
            }
            if (remainingQuantity <= 0) break; // Stop searching if order is fully allocated
          }
    
          // Check if the entire order quantity was fulfilled
          if (remainingQuantity > 0) {
            return res.status(400).send({ error: "Not enough stock available to fulfill the order" });
          }
        }


        if (affectedPurchases) updateData.affectedPurchases = affectedPurchases;
        if (totalCost) updateData.totalCost = totalCost;
        

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
    // Fetch current serial numbers for the product
    const productSaleData = await productmodule.findById(element._id).select("serialNumbers");
  
    if (!productSaleData) {
        console.error(`Product with ID ${element._id} not found.`);
        continue;
    }
  
    const existingSerialNumbers = productSaleData.serialNumbers || [];
  
    // Convert the items to remove into a Set for faster lookup
    const serialNumbersToRemoveSet = new Set(element.items.map(item => item.serial));
  
    // Filter out the serial numbers and their associated costs that need to be removed
    const updatedSerialNumbers = existingSerialNumbers.filter(
        serialObj => !serialNumbersToRemoveSet.has(serialObj.serial)
    );
  
    // Update the product's serial numbers
    await productmodule.findByIdAndUpdate(
        element._id,
        { serialNumbers: updatedSerialNumbers },
        { new: true } // Optionally return the updated document
    );
  
    console.log(`Updated serial numbers for product ID ${element._id}.`);
  }
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


      if (newinfo === "Not Sent" || newinfo === "Cancel") {


        if (order.status !== "neworder" && order.status !== "Pending RTD") {
if(order?.Product?.includes("+")){
  const order = await ordermodule.findById(orderId);

  const saleData = await combomodule.findOne({ name: order?.Product });

  for (const element of saleData.products) {
      // Fetch current sales data
      const productSaleData = await productmodule.findById({ _id: element }).select("totalsale");
      if (productSaleData) {
          // Update the sales count
          await productmodule.findByIdAndUpdate(
              { _id: element },
              { totalsale: parseInt(productSaleData.totalsale) - parseInt(order?.Quntity) }
          );
      }
      if (!order || !order.affectedPurchases) {
        return { status: 404, message: "Order not found or no tracking details available" };
    }

    // Iterate through affected purchases to revert the sold quantities
    for (let detail of order.affectedPurchases) {
        const purchase = await purchasemodule.findOne(
            { _id: detail.purchaseId, "name.productid": detail.productid }
        );

        if (purchase) {
            for (let item of purchase.name) {
                if (item.productid.toString() === detail.productid.toString()) {
                    // Decrease the sold quantity by the quantity in affectedPurchases
                    item.soldQuantity -= detail.quantity;

                    // Update the purchase record in the database
                    await purchasemodule.updateOne(
                        { _id: purchase._id, "name.productid": item.productid },
                        { $set: { "name.$.soldQuantity": item.soldQuantity } }
                    );
                    break; // Exit loop after updating the relevant item
                }
            }
        }
    }

    // Optionally, remove the affected purchases from the order after reverting the changes
    await ordermodule.updateOne(
        { _id: orderId },
        { $unset: { affectedPurchases: "" } }
    );

 
 
}

}else{



  // Assuming this function is triggered when an order is canceled
 
  // Fetch the order to get tracking details
  const order = await ordermodule.findById(orderId);

  if (!order || !order.affectedPurchases) {
      return res.status(404).send({ error: "Order not found or no tracking details available" });
  }

  // Iterate through tracked purchases to revert the sold quantities
  for (let detail of order.affectedPurchases) {
      const purchase = await purchasemodule.findOne(
          { _id: detail.purchaseId, "name.productid": detail.productid }
      );

      if (purchase) {
          for (let item of purchase.name) {
              if (item.productid.toString() === detail.productid.toString()) {
                  // Revert the sold quantity
                  item.soldQuantity -= detail.quantity;

                  // Update the purchase record in the database
                  await purchasemodule.updateOne(
                      { _id: purchase._id, "name.productid": item.productid },
                      { $set: { "name.$.soldQuantity": item.soldQuantity } }
                  );
                  break;
              }
          }
      }
  }

  // Optionally, remove the tracking details from the order
  await ordermodule.updateOne(
      { _id: orderId },
      { $unset: { affectedPurchases: "" } }
  );


 

       
          }





              if (order?.Product?.includes("+")) {
                  try {
                      const saleData = await combomodule.findOne({ name: order?.Product });

                      for (const element of saleData.products) {
                          // Fetch current sales data
                          const productSaleData = await productmodule.findById({ _id: element }).select("totalsale");
                          if (productSaleData) {
                              // Update the sales count
                              await productmodule.findByIdAndUpdate(
                                  { _id: element },
                                  { totalsale: parseInt(productSaleData.totalsale) - parseInt(order?.Quntity) }
                              );
                          }

                      }
                  } catch (error) {
                      console.error("Error updating sales data", error);
                  }
              } else {
                  const saleData = await productmodule.findOne({ name: order?.Product }).select("totalsale");
                  await productmodule.findOneAndUpdate(
                      { name: order?.Product },
                      { totalsale: parseInt(saleData.totalsale) - parseInt(order?.Quntity) }
                  );
              }

              if (order.Productserial) {
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
                      const productSaleData = await productmodule.findById(element._id).select("serialNumbers");

                      if (!productSaleData) {
                          console.error(`Product with ID ${element._id} not found.`);
                          continue;
                      }

                      const existingSerialNumbers = productSaleData.serialNumbers || [];
                      const elementsToAdd = element.items;

                      const serialNumbersMap = new Map();

                      existingSerialNumbers.forEach(serialObj => {
                          serialNumbersMap.set(serialObj.serial, serialObj);
                      });

                      elementsToAdd.forEach(newSerialObj => {
                          serialNumbersMap.set(newSerialObj.serial, newSerialObj);
                      });

                      const updatedSerialNumbers = Array.from(serialNumbersMap.values());

                      await productmodule.findByIdAndUpdate(
                          element._id,
                          { serialNumbers: updatedSerialNumbers },
                          { new: true }
                      );
                  }
              }
          }
      }

      order = await ordermodule.findByIdAndUpdate(orderId, updateData, { new: true });
      res.json({ order });

    } catch (error) {
  
    }
});



//check serialnumber and trackingid
Router.get('/trackingid/:trackingnumber', middle, async (req, res) => {
  const trackingnumber = req.params.trackingnumber;
  let order = [];
  try {
      // Determine the status to use in the query
      const status = req.query.status === "Shipped" ? "RTD" : "Pending RTD";

      // Find the order based on tracking number and status
      order = await ordermodule.findOne({ trackingnumber, status });
      
      if (!order) {
          return res.json({ error: "Product is not found", success: false });
      }

      // Check if the Product field contains a "+"
      if (order.Product.includes("+")) {
          // Find the combo module based on the product name
          const saleData = await combomodule.findOne({ name: order.Product });

          if (!saleData) {
              return res.json({ error: "Combo data not found", success: false });
          }

          // Initialize array to store product sale data
          const totalProductSaleData = [];

          // Iterate through each product in the combo
          for (const element of saleData.products) {
              // Fetch current sales data
              const productSaleData = await productmodule.findById(element);

              if (productSaleData) {
                  // Filter out invalid serial numbers and add to the array
                  const validSerialNumbers = productSaleData.serialNumbers.filter(
                      item => item.serial && !isNaN(item.cost)
                  );

                  totalProductSaleData.push({
                      product: element,
                      serialNumbers: validSerialNumbers
                  });
              } else {
                  // Handle case where product is not found
                  console.warn(`Product with ID ${element} not found.`);
              }
          }

          // Respond with order and filtered serial numbers
          res.json({
              order,
              serialNumbers: totalProductSaleData,
              products: saleData.products,
              success: true
          });

      } else {
          // Find individual product
          let product = await productmodule.findOne({ name: order.Product });

          if (!product) {
              return res.json({ error: "Product not found", success: false });
          }

          // Filter out invalid serial numbers
          const validSerialNumbers = product.serialNumbers.filter(
              item => item.serial && !isNaN(item.cost)
          );

          // Respond with order and filtered serial numbers
          res.json({
              order,
              serialNumbers: validSerialNumbers,
              products: [product._id.toString()],
              success: true
          });
      }
  } catch (error) {
      console.error("Error occurred:", error);
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

Router.get('/serialnum/:serial', middle, async (req, res) => {
  const serial = req.params.serial;

  try {
      // Find a product where the serialNumbers array contains an object with the specified serial number
      const product = await productmodule.findOne({
          serialNumbers: {
              $elemMatch: { serial: serial }
          }
      }).select("name");

      if (!product) {
          return res.json({ error: "Product is not found", success: false });
      }

      res.json({ product });

  } catch (error) {
      console.error("Error occurred:", error);
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


//show lost reports 

Router.get ('/Lostreport',async(req,res)=>{

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








 

Router.get('/mastersearch/:page', middle, async (req, res) => {
  try {
    const searchTerm = req.query.name || '';
    const page = parseInt(req.params.page) || 1;
    const limit = 20; // Number of results per page
    const skip = (page - 1) * limit;

    const isNumber = !isNaN(Number(searchTerm));
    const { startDate, endDate } = req.query;

    // Prepare the query for searching products
    const productQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
         { Serialrequired: { $regex: searchTerm, $options: 'i' } },
        { othername: { $regex: searchTerm, $options: 'i' } },
       ],
    };


    if (isNumber) {
      productQuery.$or.push(
         { MRP : Number(searchTerm) },
         { salingprice : Number(searchTerm) },
         { instock : Number(searchTerm) },
       );
    }

    // Query for purchases (no specific search criteria provided in the original API)
   
    // Prepare the query for searching orders
    const Platform = await Platformmodule.findOne({ name: searchTerm });
    let orderQuery = {
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
      ],
    };

    if (isNumber) {
      orderQuery.$or.push(
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
      orderQuery = {
        ...orderQuery,
        $or: dateFields.map(field => ({
          [field]: { $gte: dateRangeFilters[field].$gte, $lte: dateRangeFilters[field].$lte }
        }))
      };
    }

    // Fetch products
    const products = await productmodule.aggregate([
      { $match: productQuery },
      { $sort: { name: 1 } }, // Sort by name
      { $skip: skip },
      { $limit: limit }
    ]);

    // Fetch purchases
   

    // Fetch orders
    const orders = await ordermodule.find(orderQuery)
      .populate({
        path: 'Platform',
        model: 'Platform',
        select: '-password'
      })
      .skip(skip)
      .limit(limit);

    // Count documents
    const totalProducts = await productmodule.countDocuments(productQuery);
    const totalOrders = await ordermodule.countDocuments(orderQuery);

    // Combine results
    res.status(200).send({
      products,
      totalProducts,
       results:orders,
       totalDocuments :totalOrders,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'An error occurred while performing the master search.',
      error: error.message
    });
  }
});





 





Router.post('/matchserialnum/:orderId/:Condition', middle, async (req, res) => {
  const serialNumbers = req.body.serialNumbers;


let orderId = req.params.orderId
 
    const order = await ordermodule.findById(orderId);
     if (!order || !order.affectedPurchases) {
         return { status: 404, message: "Order not found or no tracking details available" };
    }

    let newAffectedPurchases = [];
    let totalRemovedCost = 0;

    // Iterate through the serial numbers
    for (let serial of serialNumbers) {
        let foundMatch = false;
console.log(serial)
        // Check if the serial corresponds to an affected purchase
        for (let detail of order.affectedPurchases) {
            if (foundMatch) break;

            const purchase = await purchasemodule.findOne(
                { _id: detail.purchaseId, "name.productid": detail.productid }
            );
            console.log(purchase)

            if (purchase) {
                for (let item of purchase.name) {
                  console.log(item.productid.toString())
                  console.log(detail.productid.toString())
                  if (item.productid.toString() === detail.productid.toString()  ) {
                    // Decrease the sold quantity by 1
                         item.soldQuantity -= 1;
                        totalRemovedCost += parseInt(item.rateper); // Calculate the cost

                        // Update the purchase record in the database
                        if ("Damaged" == req.params.Condition) {
                          const product = await productmodule.findOne({ _id: item.productid });
                      
                          if (product.totalDamaged === undefined) {
                              // If totalDamaged doesn't exist, create it with the initial value
                              await productmodule.findOneAndUpdate(
                                  { _id: item.productid },
                                  {
                                      $set: { totalDamaged: parseInt(item.soldQuantity) } // Set initial value
                                  }
                              );
                          } else {
                              // If totalDamaged exists, increment it
                              await productmodule.findOneAndUpdate(
                                  { _id: item.productid },
                                  {
                                      $inc: { totalDamaged: parseInt(item.soldQuantity) } // Increment by soldQuantity
                                  }
                              );
                          }
                      }
                      

                        console.log('item.soldQuantity',item.soldQuantity)


                        await purchasemodule.updateOne(
                            { _id: purchase._id, "name.productid": item.productid },
                            { $set: { "name.$.soldQuantity": item.soldQuantity } }
                        );

                        // Add to newAffectedPurchases
                        newAffectedPurchases.push({
                            purchaseId: detail.purchaseId,
                            productid: detail.productid,
                            quantity: 1,
                            rateper: item.rateper
                        });

                        // If the quantity is 0, remove from affectedPurchases
                        if (detail.quantity === 1) {
                            order.affectedPurchases = order.affectedPurchases.filter(p => p !== detail);
                        } else {
                            detail.quantity -= 1; // Update the quantity in affectedPurchases
                        }

                        foundMatch = true;
                        break;
                    }
                }
            }
        }
    }
 

const mergedData = newAffectedPurchases.reduce((acc, curr) => {
  const existingItem = acc.find(item =>
    item.purchaseId.equals(curr.purchaseId) &&
    item.productid.equals(curr.productid)
  );

  if (existingItem) {
    existingItem.quantity += curr.quantity;
  } else {
    acc.push({ ...curr });
  }

  return acc;
}, []);

 
 
 
    //  Update the order with remaining affectedPurchases
    await ordermodule.updateOne(
        { _id: orderId },
        { $set: { affectedPurchases: order.affectedPurchases } ,$inc: { totalCost: parseInt(-totalRemovedCost) }}
    );

  




 
  

  try {
      // Find orders matching the serial numbers
      let orders = await ordermodule.find({
          returnserial: { $in: serialNumbers },
          status: { $in: ["RTO", "DTO"] }
      });
 
      if (orders.length === 0) {
          return res.json({ error: "Orders not found", success: false });
      }

      // Function to find keys by values
      const findKeysByValues = (array, targetValues) => {
          const result = [];
          for (const obj of array) {
              for (const [key, values] of Object.entries(obj)) {
                  if (Array.isArray(values)) {
                      for (const targetValue of targetValues) {
                          const match = values.find(v => v.serial === targetValue);
                          if (match) {
                              result.push({ key, serial: targetValue, cost: match.cost });
                          }
                      }
                  }
              }
          }
          console.log(result);
          return result;
      };

      // Collect all relevant keys and serials
      let foundKeys = [];
      for (const order of orders) {
          if (order.Productserial) {
              const keys = findKeysByValues(order.Productserial, serialNumbers);
              foundKeys = [...foundKeys, ...keys]; // Merge found keys
          }
      }
 
      // Update each product with new serial numbers
      for (const element of foundKeys) {
          // Find the product by its ID
          const saleData = await productmodule.findOne({ _id: element.key }).select("serialNumbers totalsale");
          if (!saleData) {
              console.error(`Product not found for ID ${element.key}`);
              continue;
          }

          // Update serialNumbers
          const existingSerials = new Map(saleData.serialNumbers.map(item => [item.serial, item]));
          // Add or update the serial number with cost
          existingSerials.set(element.serial, { serial: element.serial, cost: element.cost });

          // Update the totalsale field
          await productmodule.findOneAndUpdate(
              { _id: element.key },
              {
                  $inc: { totalsale: -1 }, // Decrement totalsale by 1
                  $set: { serialNumbers: Array.from(existingSerials.values()) }
              }
          );

          console.log(`Updated totalsale for ${element.key} with serial ${element.serial}`);
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





 



Router.post('/matchproductids/:orderId/:Condition', middle, async (req, res) => {
  try {
    const productQuantities = req.body.productIds;
    console.log(productQuantities)
    const productIds = Object.keys(productQuantities);
    // Find the order by ID
    const order = await ordermodule.findById(req.params.orderId);
    if (!order || !order.affectedPurchases) {
      return res.status(404).send({ success: false, message: 'Order not found or no tracking details available' });
    }

    const updatePromises = order.affectedPurchases.map(async (affectedPurchase) => {
      if (productIds.includes(affectedPurchase.productid.toString())) {
        const _id = affectedPurchase.productid;
        let remainingQuantity = productQuantities[_id.toString()];

        // Fetch purchases for the given product, sorted by billdate (reverse order)
        const purchaseData = await purchasemodule.find({ _id: affectedPurchase.purchaseId, "name.productid": _id }).sort({ billdate: -1 });

        let totalRemovedCost = 0;
        let newAffectedPurchases = [];

        for (let purchase of purchaseData) {
          for (let item of purchase.name) {
            if (item.productid.toString() === _id.toString()) {
              let allocatedQuantity = Math.min(remainingQuantity, item.soldQuantity);

              // Decrease the sold quantity in the purchase record
              item.soldQuantity -= allocatedQuantity;
              totalRemovedCost += allocatedQuantity * parseInt(item.rateper);

             if ("Damaged" == req.params.Condition) {
    const product = await productmodule.findOne({ _id: item.productid });

    if (product.totalDamaged === undefined) {
        // If totalDamaged doesn't exist, create it with the initial value
        await productmodule.findOneAndUpdate(
            { _id: item.productid },
            {
                $set: { totalDamaged: parseInt(item.soldQuantity) } // Set initial value
            }
        );
    } else {
        // If totalDamaged exists, increment it
        await productmodule.findOneAndUpdate(
            { _id: item.productid },
            {
                $inc: { totalDamaged: parseInt(item.soldQuantity) } // Increment by soldQuantity
            }
        );
    }
}

              // Update the purchase record in the database
              await purchasemodule.updateOne(
                { _id: purchase._id, "name.productid": item.productid },
                { $set: { "name.$.soldQuantity": item.soldQuantity } }
              );

              // Add to newAffectedPurchases
              newAffectedPurchases.push({
                purchaseId: purchase._id,
                productid: item.productid,
                quantity: allocatedQuantity,
              });

              // Decrease the remaining quantity to be returned
              remainingQuantity -= allocatedQuantity;

              if (remainingQuantity <= 0) break;
            }
          }
          if (remainingQuantity <= 0) break;
        }

        if (remainingQuantity <= 0) {
          await productmodule.findByIdAndUpdate(
            _id,
            { $inc: { totalsale: -productQuantities[_id.toString()] } }
          );
        }


console.log('newAffectedPurchases',newAffectedPurchases)

const mergedData = newAffectedPurchases.reduce((acc, curr) => {
  const existingItem = acc.find(item =>
    item.purchaseId.equals(curr.purchaseId) &&
    item.productid.equals(curr.productid)
  );
  
  console.log('existingItem',existingItem)
  if (existingItem) {
    existingItem.quantity += curr.quantity;
  } else {
    acc.push({ ...curr });
  }
  
  return acc;
}, []);

console.log('mergedData',mergedData)
console.log('totalRemovedCost',totalRemovedCost)

// Remove entries from order.affectedPurchases that match newAffectedPurchases
order.affectedPurchases = order.affectedPurchases.map(affectedPurchase => {
  // Find the matching purchase in newAffectedPurchases
  const matchingNewPurchase = newAffectedPurchases.find(newPurchase =>
    newPurchase.purchaseId.equals(affectedPurchase.purchaseId) &&
    newPurchase.productid.equals(affectedPurchase.productid)
  );

  if (matchingNewPurchase) {
    // Decrease the quantity by the amount in newAffectedPurchases
    affectedPurchase.quantity -= matchingNewPurchase.quantity;

    // If the quantity becomes 0 or less, we don't want to keep this affectedPurchase
    if (affectedPurchase.quantity <= 0) {
      return null; // Mark for removal
    }
  }

  return affectedPurchase; // Keep the purchase with the updated quantity
}).filter(purchase => purchase !== null); // Remove any purchases marked for removal

 
// Update the order with the filtered affectedPurchases and totalCost
await ordermodule.updateOne(
  { _id: req.params.orderId },
  { 
    $set: { affectedPurchases: order.affectedPurchases },
    $inc: { totalCost: parseInt(-totalRemovedCost) }
  }
);

 
      }
    });

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

// Router.post('/matchserialnum/:orderId', middle, async (req, res) => {
//   try {
//     const productQuantities = req.body.productQuantities;
//     const productIds = Object.keys(productQuantities);

//     // Find the order by ID
//     const order = await ordermodule.findById(req.params.orderId);
//     if (!order || !order.affectedPurchases) {
//       return res.status(404).send({ success: false, message: 'Order not found or no tracking details available' });
//     }

//     let totalRemovedCost = 0;
//     let newAffectedPurchases = [];

//     const updatePromises = order.affectedPurchases.map(async (affectedPurchase) => {
//       if (productIds.includes(affectedPurchase.productid.toString())) {
//         const _id = affectedPurchase.productid;
//         let remainingQuantity = productQuantities[_id.toString()];

//         // Fetch purchases for the given product, sorted by billdate (reverse order)
//         const purchaseData = await purchasemodule.find({ _id: affectedPurchase.purchaseId, "name.productid": _id }).sort({ billdate: -1 });

//         for (let purchase of purchaseData) {
//           for (let item of purchase.name) {
//             if (item.productid.toString() === _id.toString()) {
//               let allocatedQuantity = Math.min(remainingQuantity, item.soldQuantity);

//               // Decrease the sold quantity in the purchase record
//               item.soldQuantity -= allocatedQuantity;
//               totalRemovedCost += allocatedQuantity * parseInt(item.rateper);

//               // Update the purchase record in the database
//               await purchasemodule.updateOne(
//                 { _id: purchase._id, "name.productid": item.productid },
//                 { $set: { "name.$.soldQuantity": item.soldQuantity } }
//               );

//               // Add to newAffectedPurchases
//               newAffectedPurchases.push({
//                 purchaseId: purchase._id,
//                 productid: item.productid,
//                 quantity: allocatedQuantity,
//                 rateper: item.rateper
//               });

//               // Decrease the remaining quantity to be returned
//               remainingQuantity -= allocatedQuantity;

//               if (remainingQuantity <= 0) break;
//             }
//           }
//           if (remainingQuantity <= 0) break;
//         }

//         if (remainingQuantity <= 0) {
//           await productmodule.findByIdAndUpdate(
//             _id,
//             { $inc: { totalsale: -productQuantities[_id.toString()] } }
//           );
//         }
//       }
//     });

//     await Promise.all(updatePromises);

//     // Remove entries from order.affectedPurchases that match newAffectedPurchases
//     order.affectedPurchases = order.affectedPurchases.filter(affectedPurchase => {
//       return !newAffectedPurchases.some(newPurchase =>
//         newPurchase.purchaseId.equals(affectedPurchase.purchaseId) &&
//         newPurchase.productid.equals(affectedPurchase.productid) &&
//         newPurchase.quantity === affectedPurchase.quantity
//       );
//     });

//     // Update the order with the filtered affectedPurchases and totalCost
//     await ordermodule.updateOne(
//       { _id: req.params.orderId },
//       { 
//         $set: { affectedPurchases: order.affectedPurchases },
//         $inc: { totalCost: parseInt(-totalRemovedCost) }
//       }
//     );

//     res.json({
//       success: true,
//       message: 'Order updated successfully'
//     });

//   } catch (error) {
//     console.error('Error updating order:', error);
//     res.status(500).send({ success: false, message: 'An error occurred while updating the order' });
//   }
// });



module.exports =Router




