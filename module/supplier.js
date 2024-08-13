const mongoose = require('mongoose')

const suplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
     
    GSTIN: {
      type: String,
      required: true,
    },
    Mobile: {
      type: Number,
      required: true,
    },
   
    addresh: {
      type: String,
     },
    
    

    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("supplier",suplierSchema)