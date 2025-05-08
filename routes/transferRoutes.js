const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { auth, authorize } = require('../middleware/auth');

// Initiate a transfer
router.post('/', auth, transferController.initiateTransfer);

// Complete a transfer
router.put('/:id/complete', auth, transferController.completeTransfer);

// Get all transfers for current user
router.get('/', auth, transferController.getTransfers);

// Get a specific transfer
router.get('/:id', auth, transferController.getTransferById);

module.exports = router;