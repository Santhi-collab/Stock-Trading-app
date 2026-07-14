const Order = require('../models/orderSchema');
const { getQuotes } = require('../utils/marketData');

// GET /api/orders/portfolio - the logged-in user's current holdings, priced live
const getMyPortfolio = async (req, res) => {
  try {
    const holdings = await Order.find({ user: req.user.id });
    if (holdings.length === 0) {
      return res.json({ holdings: [], totals: { invested: 0, marketValue: 0, unrealizedPnL: 0 } });
    }

    const quotes = await getQuotes(holdings.map((h) => h.symbol));
    const quoteMap = Object.fromEntries(quotes.map((q) => [q.symbol, q]));

    let invested = 0;
    let marketValue = 0;

    const priced = holdings.map((h) => {
      const quote = quoteMap[h.symbol];
      const costBasis = +(h.avgPrice * h.quantity).toFixed(2);
      const currentValue = +(quote.price * h.quantity).toFixed(2);
      const unrealizedPnL = +(currentValue - costBasis).toFixed(2);
      const unrealizedPnLPct = costBasis > 0 ? +((unrealizedPnL / costBasis) * 100).toFixed(2) : 0;

      invested += costBasis;
      marketValue += currentValue;

      return {
        symbol: h.symbol,
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        currentPrice: quote.price,
        costBasis,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPct,
      };
    });

    return res.json({
      holdings: priced,
      totals: {
        invested: +invested.toFixed(2),
        marketValue: +marketValue.toFixed(2),
        unrealizedPnL: +(marketValue - invested).toFixed(2),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch portfolio', error: err.message });
  }
};

// GET /api/orders (admin) - every user's holdings
const getAllOrders = async (req, res) => {
  try {
    const holdings = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    return res.json({ holdings });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch holdings', error: err.message });
  }
};

module.exports = { getMyPortfolio, getAllOrders };
