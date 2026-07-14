const Watchlist = require('../models/watchlistModel');
const Stock = require('../models/stockSchema');
const { getQuotes } = require('../utils/marketData');

// Ensures a user always has a watchlist document to work with
const getOrCreateWatchlist = async (userId) => {
  let watchlist = await Watchlist.findOne({ user: userId });
  if (!watchlist) watchlist = await Watchlist.create({ user: userId, symbols: [] });
  return watchlist;
};

// GET /api/watchlist - the logged-in user's watchlist, priced live
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await getOrCreateWatchlist(req.user.id);
    if (watchlist.symbols.length === 0) {
      return res.json({ symbols: [], stocks: [] });
    }

    const stocks = await Stock.find({ symbol: { $in: watchlist.symbols } });
    const quotes = await getQuotes(watchlist.symbols);
    const quoteMap = Object.fromEntries(quotes.map((q) => [q.symbol, q]));

    const payload = stocks.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      exchange: s.exchange,
      type: s.type,
      ...quoteMap[s.symbol],
    }));

    return res.json({ symbols: watchlist.symbols, stocks: payload });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch watchlist', error: err.message });
  }
};

// POST /api/watchlist - add a symbol
const addToWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ message: 'Symbol is required' });

    const sym = symbol.toUpperCase();
    const stock = await Stock.findOne({ symbol: sym, isActive: true });
    if (!stock) return res.status(404).json({ message: 'That stock is not listed' });

    const watchlist = await getOrCreateWatchlist(req.user.id);
    if (!watchlist.symbols.includes(sym)) {
      watchlist.symbols.push(sym);
      await watchlist.save();
    }

    return res.status(201).json({ symbols: watchlist.symbols });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update watchlist', error: err.message });
  }
};

// DELETE /api/watchlist/:symbol - remove a symbol
const removeFromWatchlist = async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const watchlist = await getOrCreateWatchlist(req.user.id);
    watchlist.symbols = watchlist.symbols.filter((s) => s !== sym);
    await watchlist.save();
    return res.json({ symbols: watchlist.symbols });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update watchlist', error: err.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
