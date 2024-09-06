const mongoose = require("mongoose")
require('dotenv').config();

const mongoURL = process.env.mongoURL 

const connectTomongo = () => {
    mongoose.connect(mongoURL)
        .then(() => {
            //console.log('Database connected successfully!');
        })
        .catch((error) => {
            console.error('Database connection error:', error);
        });
};
 
module.exports = connectTomongo
