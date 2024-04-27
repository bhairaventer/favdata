const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
   product:{type :String ,},
   user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
   rating :{type :Number ,default:"1"},
   comment: {type :String },
   name: {type :Object ,},
   orderid: {type :String },
   photo0: {
      data: Buffer,
      contentType: String,
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
   id: {type :String ,required :true},
   
},{ timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
