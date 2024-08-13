const mongoose = require('mongoose')

const comboproductSchema = new mongoose.Schema(
  {
    name:{type:String},
    othername:{type:Object},
    Serialrequired:{type:String},
    products: {
        type:Object,
      required: true,
    },
    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("comboProducts",comboproductSchema)