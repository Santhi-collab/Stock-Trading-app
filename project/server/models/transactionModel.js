const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
    symbol: { type: String, required: true, uppercase: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true },
    realizedPnL: { type: Number, default: 0 }, // only set on SELL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
