const mongoose = require('mongoose')
const { Schema } = mongoose;
const Userschema = new Schema({
    name:{type:"string", require : true},
    email:{type:"string", require : true ,unique : true, lowercase: true,},
    password:{type:"string", require : true},
    phone:{type:Number, require : true},
    role:{type:Number, default:0},
    date:{type: Date,default:Date.now},
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canAdd: { type: Boolean, default: false },
    verifytoken:{
        type: String,
    },
    notifytoken:{
        type: String,
    }
}) 

module.exports =mongoose.model("user",Userschema)