const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { auth, authorize } = require('../middleware/auth');

// Create a new location
router.post('/', auth, locationController.createLocation);

// Update a location
router.put('/:id', auth, locationController.updateLocation);

// Get all locations
router.get('/', auth, locationController.getLocations);

// Get a specific location
router.get('/:id', auth, locationController.getLocationById);

// Delete a location
router.delete('/:id', auth, locationController.deleteLocation);

module.exports = router;