const express = require('express');
const { createFuel, getFuel, deleteFuel } = require('../controllers/fuelController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/').post(createFuel).get(getFuel);
router.delete('/:id', deleteFuel);

module.exports = router;
