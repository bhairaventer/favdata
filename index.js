const connectTomongo = require("./db")
const express = require('express')
let cors = require('cors')
connectTomongo()
const app = express()
require('dotenv').config();

const port = process.env.PORT 
 
app.use(cors()) 
app.use(express.json())
app.use('/api/auth',require('./Routes/Auth'))
app.use('/api/coupon',require('./Routes/coupon'))
 
app.use('/api/product',require('./Routes/products'))
app.use('/api/catogary',require('./Routes/catogory'))
app.use('/api/sale',require('./Routes/sale'))
app.use('/api/cart',require('./Routes/cart'))
app.use('/api/wishlist',require('./Routes/wishlist'))
app.use('/api/address',require('./Routes/address'))
app.use('/api/order',require('./Routes/order'))
app.use('/api/review',require('./Routes/review'))
app.use('/api/return',require('./Routes/Return'))
app.use('/api/notify',require('./Routes/notify'))
app.use('/api/firebase',require('./Routes/firebase'))
app.listen(port,()=>{
    console.log(`listion `)
})
