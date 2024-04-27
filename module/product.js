const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
      lowercase: true,
    },
    color: {
      type: String,
      required: true,
      lowercase: true,
    },
    review: {
      type: Object,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    wdprice: {
      type: Number,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    sale: {
      type: mongoose.ObjectId,
      ref: "Sale", 
    },
    salediscount: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo0: {
      data: Buffer,
      contentType: String,
    },
    People:{
      type:String,
      required:true
    },
    photo1: {
      data: Buffer,
      contentType: String,
    },
    photo2: {
      data: Buffer,
      contentType: String,
    },
    photo3: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      type: Boolean,
    },

    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("Products",productSchema)