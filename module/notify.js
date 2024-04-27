const mongoose = require('mongoose')

const NotifySchema = new mongoose.Schema(
  {
    title : {
      type: String,
      required: true,
    },
    detail : {
      type: String,
      required: true,
    },
    orderid : {
      type: String,
    },
    read : {
      type: Boolean ,
      required: true,
    },
      
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    alluser:{type:String },
    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("notify",NotifySchema)