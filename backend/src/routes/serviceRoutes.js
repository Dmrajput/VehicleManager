const express = require('express');
const { createService, getServices, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/').post(createService).get(getServices);
router.delete('/:id', deleteService);

module.exports = router;
