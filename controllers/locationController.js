const Location = require('../models/Location');

const locationController = {
    createLocation: async (req, res) => {
        try {
            const {
                name,
                type,
                address,
                coordinates,
                contactInfo,
                licenses,
                certifications,
                facilityFeatures,
                storageConditions,
                securityFeatures
            } = req.body;
            
            // Create location
            const location = new Location({
                name,
                type,
                address,
                coordinates,
                owner: req.user._id,
                contactInfo,
                licenses,
                certifications,
                facilityFeatures,
                storageConditions,
                securityFeatures,
                active: true
            });
            
            await location.save();
            
            res.status(201).json({
                message: 'Location created successfully',
                location
            });
        } catch (error) {
            console.error('Error creating location:', error);
            res.status(500).json({
                message: 'Error creating location',
                error: error.message
            });
        }
    },
    
    updateLocation: async (req, res) => {
        try {
            const locationId = req.params.id;
            
            // Find location
            const location = await Location.findById(locationId);
            if (!location) {
                return res.status(404).json({ message: 'Location not found' });
            }
            
            // Check ownership
            if (location.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You are not authorized to update this location' });
            }
            
            // Update fields
            const updateFields = [
                'name', 'type', 'address', 'coordinates', 'contactInfo',
                'licenses', 'certifications', 'facilityFeatures',
                'storageConditions', 'securityFeatures', 'active'
            ];
            
            updateFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    location[field] = req.body[field];
                }
            });
            
            // Add inspection if provided
            if (req.body.inspection) {
                location.inspections.push({
                    ...req.body.inspection,
                    inspectionDate: req.body.inspection.inspectionDate || new Date()
                });
            }
            
            await location.save();
            
            res.json({
                message: 'Location updated successfully',
                location
            });
        } catch (error) {
            console.error('Error updating location:', error);
            res.status(500).json({
                message: 'Error updating location',
                error: error.message
            });
        }
    },
    
    getLocations: async (req, res) => {
        try {
            // Filter by type if provided
            const filter = {};
            if (req.query.type) {
                filter.type = req.query.type;
            }
            
            // Filter by active status if provided
            if (req.query.active !== undefined) {
                filter.active = req.query.active === 'true';
            }
            
            const locations = await Location.find(filter)
                .populate('owner', 'name email role')
                .sort({ name: 1 });
                
            res.json(locations);
        } catch (error) {
            console.error('Error fetching locations:', error);
            res.status(500).json({
                message: 'Error fetching locations',
                error: error.message
            });
        }
    },
    
    getLocationById: async (req, res) => {
        try {
            const location = await Location.findById(req.params.id)
                .populate('owner', 'name email role');
                
            if (!location) {
                return res.status(404).json({ message: 'Location not found' });
            }
            
            res.json(location);
        } catch (error) {
            console.error('Error fetching location:', error);
            res.status(500).json({
                message: 'Error fetching location',
                error: error.message
            });
        }
    },
    
    deleteLocation: async (req, res) => {
        try {
            const location = await Location.findById(req.params.id);
            
            if (!location) {
                return res.status(404).json({ message: 'Location not found' });
            }
            
            // Check ownership
            if (location.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You are not authorized to delete this location' });
            }
            
            await Location.findByIdAndDelete(req.params.id);
            
            res.json({ message: 'Location deleted successfully' });
        } catch (error) {
            console.error('Error deleting location:', error);
            res.status(500).json({
                message: 'Error deleting location',
                error: error.message
            });
        }
    }
};

module.exports = locationController;