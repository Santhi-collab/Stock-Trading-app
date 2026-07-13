const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    contact: { type: String, trim: true },
    userType: { type: String, enum: ['Trader', 'Investor'], default: 'Trader' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: { type: Number, default: Number(process.env.STARTING_BALANCE) || 100000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
