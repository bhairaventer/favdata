 

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
 
    

    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    orderid:{type:String,required:true},
    products : {type:Object ,required:true},
    paymentinfo:{type:String , default:""},
    address :{type :Object ,required :true},
    trackingnumber :{type :String},
    retunvalid :{type :Date},
    amount :{type :Number ,required :true},
    userdata:{type :Object ,required :true},
    status:{type :String ,required : true}
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("Order",orderSchema)