const mongoose = require('mongoose')

const purchaseSchema = new mongoose.Schema(
  {
    name: {
      type: Object,
      required: true,
    },
    
    billno: {
      type: Number,
      required: true,
    },
    billdate: {
      type: Date,
      required: true,
    },
    Supplier: {
      type: String,
      required: true,
    },
    
   

    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("Purchase",purchaseSchema)