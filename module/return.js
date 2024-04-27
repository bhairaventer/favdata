const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
   user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
   problem :{type :String , required:true},
   issue: {type :String ,required :true},
   orderid: {type :String ,required :true},
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
},{ timestamps: true });

const Return = mongoose.model('Return', returnSchema);

module.exports = Return;
