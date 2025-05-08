const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { auth, authorize } = require('../middleware/auth');

// Create a new shipment
router.post('/', auth, shipmentController.createShipment);

// Update shipment status
router.put('/:shipmentId', auth, shipmentController.updateShipmentStatus);

// Get all shipments for current user
router.get('/', auth, shipmentController.getShipments);

// Get a specific shipment
router.get('/:id', auth, shipmentController.getShipmentById);

module.exports = router;