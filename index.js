const connectTomongo = require("./db");
const express = require('express');
let cors = require('cors');
const path = require('path');

connectTomongo();
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Define your API routes
app.use('/api/auth', require('./Routes/Auth'));
app.use('/api/product', require('./Routes/products'));
app.use('/api/order', require('./Routes/order'));
app.use('/api/purchase', require('./Routes/purchase'));
app.use('/api/supplier', require('./Routes/supplier'));
app.use('/api/courier', require('./Routes/courier'));
app.use('/api/platform', require('./Routes/Platform'));
app.use('/api/combo', require('./Routes/comboproducts'));
app.use('/api/category', require('./Routes/category'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all handler to send back React's index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
