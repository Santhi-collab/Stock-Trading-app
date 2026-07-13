const mongoose = require('mongoose');

// The "My Account" wallet ledger — deposits and withdrawals of virtual cash.
// Kept separate from the stock buy/sell Transaction log, matching the app's
// distinct "Orders" (stock trades) vs "Transactions" (wallet activity) views.
const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    action: { type: String, enum: ['DEPOSIT', 'WITHDRAW'], required: true },
    paymentMode: {
      type: String,
      enum: ['IMPS', 'NEFT', 'UPI', 'Net Banking', 'Card'],
      default: 'UPI',
    },
    status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
