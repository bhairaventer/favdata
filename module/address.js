const mongoose = require('mongoose')

const AddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    
   address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
  selected :{
    type: Boolean,
  },
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("Address",AddressSchema)