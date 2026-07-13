const User = require("../models/userModel");
const Order = require("../models/orderSchema");
const Transaction = require("../models/transactionModel");
const Portfolio = require("../models/portfolioModel");
const { getQuote } = require("../utils/marketData");

const resolvePortfolio = async (userId, portfolioId) => {
  if (portfolioId) {
    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      user: userId,
    });
    if (portfolio) return portfolio;
  }
  // Fall back to the user's oldest (default) portfolio if none was specified
  const existing = await Portfolio.findOne({ user: userId }).sort({
    createdAt: 1,
  });
  if (existing) return existing;

  // Self-healing: accounts created before auto-portfolio-creation was added
  // won't have one yet. Create it on first trade instead of failing.
  return Portfolio.create({ user: userId, name: "Main", isDefault: true });
};

// POST /api/transactions/buy
const buyStock = async (req, res) => {
  try {
    const { symbol, quantity, portfolioId } = req.body;
    const qty = Number(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res
        .status(400)
        .json({ message: "Symbol and a positive quantity are required" });
    }

    const portfolio = await resolvePortfolio(req.user.id, portfolioId);
    if (!portfolio)
      return res
        .status(400)
        .json({ message: "No portfolio found for this trade" });

    const sym = symbol.toUpperCase();
    const quote = await getQuote(sym);
    const cost = +(quote.price * qty).toFixed(2);

    const user = await User.findById(req.user.id);
    if (user.balance < cost) {
      return res
        .status(400)
        .json({ message: "Insufficient virtual balance for this trade" });
    }

    user.balance = +(user.balance - cost).toFixed(2);
    await user.save();

    let holding = await Order.findOne({
      portfolio: portfolio._id,
      symbol: sym,
    });
    if (holding) {
      const newQty = holding.quantity + qty;
      const newAvg = (holding.avgPrice * holding.quantity + cost) / newQty;
      holding.quantity = newQty;
      holding.avgPrice = +newAvg.toFixed(2);
      await holding.save();
    } else {
      holding = await Order.create({
        user: user._id,
        portfolio: portfolio._id,
        symbol: sym,
        quantity: qty,
        avgPrice: quote.price,
      });
    }

    const txn = await Transaction.create({
      user: user._id,
      portfolio: portfolio._id,
      symbol: sym,
      type: "BUY",
      quantity: qty,
      price: quote.price,
      total: cost,
    });

    return res
      .status(201)
      .json({ transaction: txn, holding, balance: user.balance });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Buy order failed", error: err.message });
  }
};

// POST /api/transactions/sell
const sellStock = async (req, res) => {
  try {
    const { symbol, quantity, portfolioId } = req.body;
    const qty = Number(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res
        .status(400)
        .json({ message: "Symbol and a positive quantity are required" });
    }

    const portfolio = await resolvePortfolio(req.user.id, portfolioId);
    if (!portfolio)
      return res
        .status(400)
        .json({ message: "No portfolio found for this trade" });

    const sym = symbol.toUpperCase();
    const holding = await Order.findOne({
      portfolio: portfolio._id,
      symbol: sym,
    });
    if (!holding || holding.quantity < qty) {
      return res
        .status(400)
        .json({
          message:
            "You do not own enough shares in this portfolio to sell that quantity",
        });
    }

    const quote = await getQuote(sym);
    const proceeds = +(quote.price * qty).toFixed(2);
    const realizedPnL = +((quote.price - holding.avgPrice) * qty).toFixed(2);

    const user = await User.findById(req.user.id);
    user.balance = +(user.balance + proceeds).toFixed(2);
    await user.save();

    holding.quantity -= qty;
    if (holding.quantity === 0) {
      await holding.deleteOne();
    } else {
      await holding.save();
    }

    const txn = await Transaction.create({
      user: user._id,
      portfolio: portfolio._id,
      symbol: sym,
      type: "SELL",
      quantity: qty,
      price: quote.price,
      total: proceeds,
      realizedPnL,
    });

    return res
      .status(201)
      .json({ transaction: txn, balance: user.balance, realizedPnL });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Sell order failed", error: err.message });
  }
};

// GET /api/transactions/me?portfolioId=... - optionally scoped to one portfolio
const getMyTransactions = async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.portfolioId) filter.portfolio = req.query.portfolioId;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    return res.json({ transactions });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch transactions", error: err.message });
  }
};

// GET /api/transactions (admin) - every transaction, all users
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .populate("portfolio", "name")
      .sort({ createdAt: -1 })
      .limit(500);
    return res.json({ transactions });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch transactions", error: err.message });
  }
};

module.exports = { buyStock, sellStock, getMyTransactions, getAllTransactions };
