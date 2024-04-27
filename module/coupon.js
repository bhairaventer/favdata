

const mongoose = require('mongoose')
const { Schema } = mongoose;
const couponSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase :true,
  },
  expire: {
    type: Date,
    // required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  quntity: {
    type: Number,
    required: true,
  },
  user:{type:String},
  onlyuser:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
  date:{type: Date,default:Date.now}
})

module.exports =mongoose.model("coupon",couponSchema)