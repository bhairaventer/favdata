const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema(
  {
    productname: {
      type: String,
      required: true,
    },
    productslug: {
      type: String,
      required: true,
    },
    productdescription: {
      type: String,
      required: true,
    },
    productprice: {
      type: Number,
      required: true,
    },
    
    productquantity: {
      type: Number,
      required: true,
    },
    productsize: {
      type: String,
      required: true,
    },
    productcolor: {
      type: String,
      required: true,
    },
    productcategory: {
      type: String,
      required: true,
    },
    productid: {
      type: String,
      required: true,
    },
    totaladded: {
      type: Number,
      required: true,
    },
    

    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("cart",cartSchema)