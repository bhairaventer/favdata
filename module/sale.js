
const mongoose = require('mongoose')
const { Schema } = mongoose;
const saleSchema = new Schema({
    name:{type:"string", require : true},
         photo: {
          data: Buffer,
          contentType: String,
        },
        discount: {
            type: Number,
            required: true,
          },
    date:{type: Date,default:Date.now}
})
module.exports =mongoose.model("Sale",saleSchema)