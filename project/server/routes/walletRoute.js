const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { deposit, withdraw, getMyWallet, getAllWalletTransactions } = require('../controllers/walletController');

router.post('/deposit', protect, deposit);
router.post('/withdraw', protect, withdraw);
router.get('/me', protect, getMyWallet);
router.get('/', protect, adminOnly, getAllWalletTransactions);

module.exports = router;
