const mongoose = require('mongoose');

// One watchlist per user (spec calls for "Watchlist Management" as a core
// module). Kept as a single growable list of symbols rather than multiple
// named lists, mirroring the single "Watchlists" collection in the brief.
const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    symbols: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
