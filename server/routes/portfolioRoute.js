const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyPortfolios,
  createPortfolio,
  renamePortfolio,
  deletePortfolio,
} = require('../controllers/portfolioController');

router.get('/', protect, getMyPortfolios);
router.post('/', protect, createPortfolio);
router.put('/:id', protect, renamePortfolio);
router.delete('/:id', protect, deletePortfolio);

module.exports = router;
