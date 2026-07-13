const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');

router.get('/', protect, getWatchlist);
router.post('/', protect, addToWatchlist);
router.delete('/:symbol', protect, removeFromWatchlist);

module.exports = router;
