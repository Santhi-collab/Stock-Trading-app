// One-off script: node seed.js
// Populates the Stocks collection with a starter list and creates a demo
// admin account (with a default portfolio) so you have something to log
// in with immediately.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Stock = require('./models/stockSchema');
const User = require('./models/userModel');
const Portfolio = require('./models/portfolioModel');

const STARTER_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', type: 'Common Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', type: 'Common Stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', type: 'Common Stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', type: 'Common Stock' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financials', type: 'Common Stock' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financials', type: 'Common Stock' },
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services', type: 'Common Stock' },
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Staples', type: 'Common Stock' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', type: 'Common Stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', type: 'Common Stock' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Discretionary', type: 'Common Stock' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financials', type: 'Common Stock' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', type: 'Common Stock' },
  { symbol: 'BABA', name: 'Alibaba Group Holding Ltd.', sector: 'Consumer Discretionary', type: 'Depositary Receipt' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor Mfg.', sector: 'Technology', type: 'Depositary Receipt' },
];

async function ensureDefaultPortfolio(userId) {
  const existing = await Portfolio.findOne({ user: userId });
  if (existing) return existing;
  return Portfolio.create({ user: userId, name: 'Main', isDefault: true });
}

async function seed() {
  await connectDB();

  for (const s of STARTER_STOCKS) {
    await Stock.findOneAndUpdate({ symbol: s.symbol }, s, { upsert: true, new: true });
  }
  console.log(`Seeded ${STARTER_STOCKS.length} stocks.`);

  const adminEmail = 'admin@sbstocks.demo';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashed = await bcrypt.hash('Admin@123', 10);
    admin = await User.create({
      name: 'SB Stocks Admin',
      email: adminEmail,
      password: hashed,
      role: 'admin',
      balance: Number(process.env.STARTING_BALANCE) || 100000,
    });
    console.log(`Created demo admin -> email: ${adminEmail} | password: Admin@123`);
  } else {
    console.log('Demo admin already exists, skipping.');
  }
  await ensureDefaultPortfolio(admin._id);

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
