const express = require('express');
const {
  getProfile,
  updateProfile,
  getDashboard,
  getExpenseTrends,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/profile').get(getProfile).put(updateProfile);
router.get('/dashboard', getDashboard);
router.get('/expenses', getExpenseTrends);

module.exports = router;
