 

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
 
    ordercome :{type :Number},
    Platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
    OrderId:{type:String,required:true},
    Product : {type:Object ,required:true},
    TransferPrice :{type :Number },
    affectedPurchases: [{
      purchaseId: mongoose.Schema.Types.ObjectId,
      productid: mongoose.Schema.Types.ObjectId,
      quantity: Number
  }],
    Salesamount :{type :Number },
    Quntity :{type :Number ,required :true},
    Tax :{type :String},
    Paymentmode:{type:String , default:""},
    Address :{type :String ,required :true},
    Pincode :{type :Number ,required :true},
    MobNo :{type :String },
    State :{type :String },
     Productserial:{type :Object ,},
    returnserial:{type :Object ,},
    Dispatchbydate:{type :Date , },
    Deliverybydate:{type :Date},
    Condition:{type :String},
    shippingcharge:{type :String},
    refundCondition:{type :String},
    refunddate:{type :Date ,default:Date.now},
    shipdate:{type :Date},
    productdata:{type :Object},
    OFDdate:{type :Date},
    DTOdate:{type :Date},
    courier:{type :String},
    Billno:{type :String },
    Billdate:{type :Date,default:Date.now },
    orderdate:{type :Date  },
    Lrno:{type :String },
    trackingnumber :{type :String},
    status:{type :String },
    claimstatus:{type :String },
    claimapplied:{type :String },
    claimamount:{type :String },
    claimrequired:{type :String },
    Realisablevalue:{type :String },
    claimdate:{type :Date },
    Lostdate:{type :Date },
    returndate:{type :Date },
    ReceivedDate:{type :Date },
    totalCost:{type:Number}
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("Order",orderSchema)