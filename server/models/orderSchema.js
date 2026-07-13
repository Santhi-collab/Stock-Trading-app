const mongoose = require('mongoose');

// A "holding" — a user's current position in one stock, scoped to a specific
// Portfolio (a user can run several portfolios side by side). Kept separate
// from Transaction (the immutable buy/sell log) so portfolio lookups stay
// cheap: this collection always reflects current quantity + average cost only.
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0 },
    avgPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ portfolio: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);
