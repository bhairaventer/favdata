const mongoose = require('mongoose')
const { Schema } = mongoose;
const categorySchema = new Schema({
    name:{type:"string", require : true},
     
    slug: {
           type: String,
           lowercase: true,
         },
         categoryphoto: {
          data: Buffer,
          contentType: String,
        },
    date:{type: Date,default:Date.now}
})
module.exports =mongoose.model("Category",categorySchema)