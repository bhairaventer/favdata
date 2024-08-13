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
  
app.use('/api/product',require('./Routes/products'))
 app.use('/api/order',require('./Routes/order'))
 app.use('/api/purchase',require('./Routes/purchase'))
app.use('/api/supplier',require('./Routes/supplier'))
app.use('/api/courier',require('./Routes/courier'))
app.use('/api/Platform',require('./Routes/Platform'))
app.use('/api/combo',require('./Routes/comboproducts'))
app.listen(port,()=>{
    console.log(`listion `)
})
