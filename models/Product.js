const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    // Pharmaceutical specific fields
    activeIngredients: [{ 
        name: { type: String },
        quantity: { type: String },
        unit: { type: String }
    }],
    dosageForm: { 
        type: String, 
        enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment', 'powder', 'other'],
        required: true 
    },
    strength: { type: String, required: true }, // e.g., "500mg", "50mg/ml"
    packageSize: { type: String }, // e.g., "30 tablets", "100ml"
    ndc: { type: String }, // National Drug Code (for US pharmaceuticals)
    // Regulatory information
    approvalNumber: { type: String },
    regulatoryStatus: { 
        type: String, 
        enum: ['approved', 'investigational', 'recalled', 'discontinued'] 
    },
    // Manufacturing details
    manufacturer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    batchNumber: { type: String, required: true },
    serialNumber: { type: String, unique: true },
    manufactureDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    // Supply chain tracking
    currentOwner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    currentOwnerWallet: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Created', 'QualityChecked', 'ShippedToDistributor', 'ReceivedByDistributor', 
               'ShippedToRetailer', 'ReceivedByRetailer', 'Sold', 'Dispensed', 'Recalled'], 
        default: 'Created' 
    },
    // Storage requirements
    storageConditions: {
        temperatureMin: { type: Number }, // in Celsius
        temperatureMax: { type: Number },
        humidity: { type: String },
        lightSensitive: { type: Boolean, default: false },
        specialInstructions: { type: String }
    },
    // Tracking history
    currentLocation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Location' 
    },
    locationHistory: [{
        location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
        timestamp: { type: Date, default: Date.now },
        temperature: { type: Number }
    }],
    transferHistory: [{
        transfer: { type: mongoose.Schema.Types.ObjectId, ref: 'Transfer' },
        timestamp: { type: Date, default: Date.now }
    }],
    conditionLogs: [{
        temperature: { type: Number },
        humidity: { type: Number },
        timestamp: { type: Date, default: Date.now },
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    // Blockchain information
    blockchainInfo: {
        registered: { type: Boolean, default: false },
        transactionHash: { type: String },
        blockNumber: { type: Number },
        contractAddress: { type: String }
    },
    // Additional information
    price: { type: Number },
    category: { type: String },
    qrCode: { type: String },
    image: { type: String },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);