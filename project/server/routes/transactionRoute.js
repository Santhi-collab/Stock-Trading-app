const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  buyStock,
  sellStock,
  getMyTransactions,
  getAllTransactions,
} = require('../controllers/transactionController');

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/me', protect, getMyTransactions);
router.get('/', protect, adminOnly, getAllTransactions);

module.exports = router;
