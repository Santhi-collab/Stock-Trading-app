const mongoose = require('mongoose');

// A user can run several independent virtual portfolios (e.g. "Main",
// "Growth Bets", "Dividend Test") to compare strategies side by side.
const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

portfolioSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
