require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('./db/connection');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const transferRoutes = require('./routes/transferRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const locationRoutes = require('./routes/locationRoutes');



const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],// Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/locations', locationRoutes);


app.get('/', (req, res) => {
    res.send('Supply Chain Blockchain API');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});