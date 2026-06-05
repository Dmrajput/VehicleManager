const express = require('express');
const { getReminders } = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getReminders);

module.exports = router;
