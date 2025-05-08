const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    shipmentId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }],
    // Shipment participants
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    senderWallet: { 
        type: String, 
        required: true 
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    receiverWallet: { 
        type: String, 
        required: true 
    },
    // Locations
    origin: {
        name: { type: String },
        address: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    destination: {
        name: { type: String },
        address: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    // Carrier information
    carrier: {
        name: { type: String },
        contactInfo: { type: String },
        trackingNumber: { type: String },
        vehicleId: { type: String },
        driverInfo: { type: String }
    },
    // Shipment status
    status: { 
        type: String, 
        enum: ['created', 'in_transit', 'delivered', 'cancelled', 'delayed'], 
        default: 'created' 
    },
    // Pharmaceutical-specific shipment data
    shipmentType: {
        type: String,
        enum: ['ambient', 'refrigerated', 'frozen', 'controlled_substance', 'hazardous'],
        required: true
    },
    temperatureMonitoring: {
        deviceId: { type: String },
        deviceType: { type: String },
        dataLoggingInterval: { type: Number } // in minutes
    },
    temperatureReadings: [{
        timestamp: { type: Date },
        temperature: { type: Number },
        location: { 
            lat: { type: Number },
            lng: { type: Number }
        }
    }],
    // Regulatory information
    exportLicense: { type: String },
    importLicense: { type: String },
    customsClearance: {
        clearanceNumber: { type: String },
        clearanceDate: { type: Date },
        customsOfficer: { type: String }
    },
    // Blockchain information
    transactionHash: { 
        type: String 
    },
    // Dates
    expectedDeliveryDate: { 
        type: Date 
    },
    actualDeliveryDate: { 
        type: Date 
    },
    // Environmental conditions
    conditions: {
        temperature: { 
            min: { type: Number },
            max: { type: Number },
            target: { type: Number }
        },
        humidity: { 
            min: { type: Number },
            max: { type: Number },
            target: { type: Number }
        },
        specialHandling: { type: String }
    },
    // Additional information
    notes: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Shipment', shipmentSchema);