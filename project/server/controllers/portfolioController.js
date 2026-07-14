const Portfolio = require('../models/portfolioModel');
const Order = require('../models/orderSchema');
const Transaction = require('../models/transactionModel');

// GET /api/portfolios - list the logged-in user's portfolios
const getMyPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user.id }).sort({ createdAt: 1 });
    return res.json({ portfolios });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch portfolios', error: err.message });
  }
};

// POST /api/portfolios - create a new named portfolio
const createPortfolio = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Portfolio name is required' });
    }

    const exists = await Portfolio.findOne({ user: req.user.id, name: name.trim() });
    if (exists) return res.status(409).json({ message: 'You already have a portfolio with that name' });

    const portfolio = await Portfolio.create({ user: req.user.id, name: name.trim() });
    return res.status(201).json({ portfolio });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create portfolio', error: err.message });
  }
};

// PUT /api/portfolios/:id - rename a portfolio
const renamePortfolio = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Portfolio name is required' });
    }

    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user.id });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

    portfolio.name = name.trim();
    await portfolio.save();
    return res.json({ portfolio });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to rename portfolio', error: err.message });
  }
};

// DELETE /api/portfolios/:id - remove a portfolio (must be empty, and not the last one)
const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user.id });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

    const total = await Portfolio.countDocuments({ user: req.user.id });
    if (total <= 1) {
      return res.status(400).json({ message: 'You must keep at least one portfolio' });
    }

    const openPositions = await Order.countDocuments({ portfolio: portfolio._id, quantity: { $gt: 0 } });
    if (openPositions > 0) {
      return res.status(400).json({ message: 'Sell all positions in this portfolio before deleting it' });
    }

    await portfolio.deleteOne();
    await Transaction.deleteMany({ portfolio: portfolio._id }); // keep ledger tidy once portfolio is gone
    return res.json({ message: `Portfolio "${portfolio.name}" deleted` });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete portfolio', error: err.message });
  }
};

module.exports = { getMyPortfolios, createPortfolio, renamePortfolio, deletePortfolio };
