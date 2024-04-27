const mongoose = require("mongoose")
require('dotenv').config();

const mongoURL = process.env.mongoURL 

const connectTomongo =()=>{
    try {
        
    
    mongoose.connect(mongoURL) 
    .then(() => console.log('database Connected!'));
} catch (error) {
        console.log(error)
}
}
 
module.exports = connectTomongo
