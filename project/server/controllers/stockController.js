const Stock = require('../models/stockSchema');
const { getQuote, getQuotes, getHistory } = require('../utils/marketData');

// GET /api/stocks - list all active stocks with live quotes
const getStocks = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { symbol: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
      ];
    }

    const stocks = await Stock.find(filter).sort({ symbol: 1 });
    const quotes = await getQuotes(stocks.map((s) => s.symbol));
    const quoteMap = Object.fromEntries(quotes.map((q) => [q.symbol, q]));

    const payload = stocks.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      exchange: s.exchange,
      type: s.type,
      ...quoteMap[s.symbol],
    }));

    return res.json({ stocks: payload });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch stocks', error: err.message });
  }
};

// GET /api/stocks/:symbol - single stock detail + history for charting
const getStockDetail = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = await Stock.findOne({ symbol });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });

    const quote = await getQuote(symbol);
    const history = getHistory(symbol, 60);

    return res.json({
      stock: {
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        exchange: stock.exchange,
        type: stock.type,
      },
      quote,
      history,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch stock detail', error: err.message });
  }
};

// POST /api/stocks (admin) - add a new listing
const addStock = async (req, res) => {
  try {
    const { symbol, name, sector, exchange, type } = req.body;
    if (!symbol || !name) {
      return res.status(400).json({ message: 'Symbol and name are required' });
    }

    const exists = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (exists) return res.status(409).json({ message: 'Stock already listed' });

    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      name,
      sector,
      exchange,
      type: type || 'Common Stock',
    });
    return res.status(201).json({ stock });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add stock', error: err.message });
  }
};

// PUT /api/stocks/:symbol (admin) - edit an existing listing
const updateStock = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { name, sector, exchange, type } = req.body;

    const stock = await Stock.findOne({ symbol });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });

    if (name) stock.name = name;
    if (sector) stock.sector = sector;
    if (exchange) stock.exchange = exchange;
    if (type) stock.type = type;
    await stock.save();

    return res.json({ stock });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update stock', error: err.message });
  }
};

// DELETE /api/stocks/:symbol (admin) - delist a stock (soft delete)
const removeStock = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = await Stock.findOneAndUpdate({ symbol }, { isActive: false }, { new: true });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    return res.json({ message: `${symbol} delisted`, stock });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to remove stock', error: err.message });
  }
};

module.exports = { getStocks, getStockDetail, addStock, updateStock, removeStock };
