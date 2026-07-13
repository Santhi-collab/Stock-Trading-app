const mongoose = require('mongoose');

// Master list of tradable stocks. Live price is fetched on demand (see
// utils/marketData.js) rather than stored here, so this collection mainly
// tracks which symbols are listed and lets an admin add/remove them.
const stockSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    sector: { type: String, default: 'General' },
    exchange: { type: String, default: 'NASDAQ' },
    type: { type: String, default: 'Common Stock' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stock', stockSchema);
