const { text } = require('express');
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ordercome :{
      type: Number,
      default:0
    },
    totalDamaged :{
      type: Number,
      default:0
    },

    salingprice: {
      type: Number,
      required: true,
    },
    MRP: {
      type: Number,
      required: true,
    },
    
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    instock: {
      type: Number,
      default:0
    },
    purchasestock: {
      type: Number,
      default:0
    },
    totalsale: {
      type: Number,
      default:0
    },
    
    othername: {
      type:Object,
    },
    serialNumbers:{
      type:Object
    },
    Serialrequired:{
      type:String
    }

    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("Products",productSchema)