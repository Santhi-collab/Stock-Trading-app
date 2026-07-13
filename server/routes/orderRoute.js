const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getMyPortfolio, getAllOrders } = require('../controllers/orderController');

router.get('/portfolio', protect, getMyPortfolio);
router.get('/', protect, adminOnly, getAllOrders);

module.exports = router;
