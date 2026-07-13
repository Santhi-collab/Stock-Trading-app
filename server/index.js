// =====================================================
// SB Stocks - Main server entry point
// =====================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const userRoutes = require('./routes/userRoute');
const stockRoutes = require('./routes/stockRoute');
const orderRoutes = require('./routes/orderRoute');
const transactionRoutes = require('./routes/transactionRoute');
const walletRoutes = require('./routes/walletRoute');
const portfolioRoutes = require('./routes/portfolioRoute');
const watchlistRoutes = require('./routes/watchlistRoute');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);

// 404 handler
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SB Stocks server running on port ${PORT}`));
