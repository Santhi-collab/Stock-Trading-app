const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  contact: user.contact,
  userType: user.userType,
  role: user.role,
  balance: user.balance,
});

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, contact, userType } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      contact,
      userType: userType === 'Investor' ? 'Investor' : 'Trader',
    });

    // Every trader starts with one default portfolio so buy/sell works immediately
    await Portfolio.create({ user: user._id, name: 'Main', isDefault: true });

    return res.status(201).json({ token: signToken(user._id), user: sanitize(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({ token: signToken(user._id), user: sanitize(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GET /api/users/me
const getProfile = async (req, res) => {
  return res.json({ user: sanitize(req.user) });
};

// PUT /api/users/me
const updateProfile = async (req, res) => {
  try {
    const { name, contact, password } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (contact) user.contact = contact;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    return res.json({ user: sanitize(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// GET /api/users (admin) - list all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile, getAllUsers };
