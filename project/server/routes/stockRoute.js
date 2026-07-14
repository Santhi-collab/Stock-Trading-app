const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getStocks, getStockDetail, addStock, updateStock, removeStock } = require('../controllers/stockController');

router.get('/', protect, getStocks);
router.get('/:symbol', protect, getStockDetail);
router.post('/', protect, adminOnly, addStock);
router.put('/:symbol', protect, adminOnly, updateStock);
router.delete('/:symbol', protect, adminOnly, removeStock);

module.exports = router;
