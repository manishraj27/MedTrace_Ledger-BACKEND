const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['manufacturer', 'distributor', 'wholesaler', 'pharmacy', 'hospital', 'warehouse', 'laboratory', 'other'], 
        required: true 
    },
    // Address information
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        postalCode: { type: String }
    },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    // Ownership and contact
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    contactInfo: {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        emergencyContact: { type: String }
    },
    // Pharmaceutical-specific facility information
    licenses: [{
        licenseType: { type: String },
        licenseNumber: { type: String },
        issuedBy: { type: String },
        issuedDate: { type: Date },
        expiryDate: { type: Date },
        status: { type: String, enum: ['active', 'expired', 'suspended', 'revoked'] }
    }],
    certifications: [{
        certificationType: { type: String },
        certificationNumber: { type: String },
        issuedBy: { type: String },
        issuedDate: { type: Date },
        expiryDate: { type: Date }
    }],
    facilityFeatures: [{
        type: String,
        enum: ['cold_storage', 'controlled_substance_storage', 'clean_room', 'laboratory', 
               'packaging_facility', 'sterilization_facility', 'quarantine_area']
    }],
    // Storage conditions
    storageConditions: {
        temperature: {
            min: { type: Number },
            max: { type: Number },
            monitoringSystem: { type: String }
        },
        humidity: {
            min: { type: Number },
            max: { type: Number },
            monitoringSystem: { type: String }
        },
        specialFeatures: [{ type: String }]
    },
    // Security features
    securityFeatures: [{
        type: String,
        enum: ['24hr_security', 'cctv', 'restricted_access', 'alarm_system', 
               'temperature_alerts', 'backup_power']
    }],
    // Status
    active: { 
        type: Boolean, 
        default: true 
    },
    // Inspection history
    inspections: [{
        inspectionType: { type: String },
        inspectionDate: { type: Date },
        inspectedBy: { type: String },
        result: { type: String, enum: ['passed', 'failed', 'conditional'] },
        notes: { type: String }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);