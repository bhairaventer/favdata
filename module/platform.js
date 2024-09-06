const mongoose = require('mongoose')
const { Schema } = mongoose;
const PlatformSchema = new Schema({
    name:{type:"string", require : true , },
     
    slug: {
           type: String,
           lowercase: true,
         },
        
    date:{type: Date,default:Date.now}
})
module.exports =mongoose.model("Platform",PlatformSchema)