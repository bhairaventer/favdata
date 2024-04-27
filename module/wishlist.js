const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema(
  {
    wpid: {
      type: String,
      required: true,
    },
     
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    
  },
  { timestamps: true }
);
 
module.exports =mongoose.model("wishlist",wishlistSchema)