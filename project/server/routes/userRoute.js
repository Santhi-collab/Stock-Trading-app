const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
