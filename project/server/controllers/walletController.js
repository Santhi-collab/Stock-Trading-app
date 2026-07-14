const User = require('../models/userModel');
const WalletTransaction = require('../models/walletTransactionModel');

const VALID_MODES = ['IMPS', 'NEFT', 'UPI', 'Net Banking', 'Card'];

// POST /api/wallet/deposit - "Add Funds"
const deposit = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const paymentMode = VALID_MODES.includes(req.body.paymentMode) ? req.body.paymentMode : 'UPI';

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount to add' });
    }

    const user = await User.findById(req.user.id);
    user.balance = +(user.balance + amount).toFixed(2);
    await user.save();

    const txn = await WalletTransaction.create({
      user: user._id,
      amount: +amount.toFixed(2),
      action: 'DEPOSIT',
      paymentMode,
    });

    return res.status(201).json({ transaction: txn, balance: user.balance });
  } catch (err) {
    return res.status(500).json({ message: 'Deposit failed', error: err.message });
  }
};

// POST /api/wallet/withdraw
const withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const paymentMode = VALID_MODES.includes(req.body.paymentMode) ? req.body.paymentMode : 'UPI';

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount to withdraw' });
    }

    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for this withdrawal' });
    }

    user.balance = +(user.balance - amount).toFixed(2);
    await user.save();

    const txn = await WalletTransaction.create({
      user: user._id,
      amount: +amount.toFixed(2),
      action: 'WITHDRAW',
      paymentMode,
    });

    return res.status(201).json({ transaction: txn, balance: user.balance });
  } catch (err) {
    return res.status(500).json({ message: 'Withdrawal failed', error: err.message });
  }
};

// GET /api/wallet/me - the logged-in user's wallet ledger
const getMyWallet = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch wallet history', error: err.message });
  }
};

// GET /api/wallet (admin) - every wallet transaction, all users
const getAllWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(500);
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch wallet transactions', error: err.message });
  }
};

module.exports = { deposit, withdraw, getMyWallet, getAllWalletTransactions };
