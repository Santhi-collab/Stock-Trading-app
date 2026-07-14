// Central export so any file can do `const { User, Stock, Order, Transaction } = require('../Schemas')`
const User = require('./models/userModel');
const Stock = require('./models/stockSchema');
const Order = require('./models/orderSchema');
const Transaction = require('./models/transactionModel');
const Portfolio = require('./models/portfolioModel');
const Watchlist = require('./models/watchlistModel');
const WalletTransaction = require('./models/walletTransactionModel');

module.exports = { User, Stock, Order, Transaction, Portfolio, Watchlist, WalletTransaction };
