const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    transferId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    // Transfer participants
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
    // Transfer status
    status: { 
        type: String, 
        enum: ['initiated', 'in_transit', 'completed', 'rejected', 'recalled'], 
        default: 'initiated' 
    },
    // Pharmaceutical-specific transfer data
    coldChainMaintained: { 
        type: Boolean, 
        default: true 
    },
    temperatureExcursions: [{
        timestamp: { type: Date },
        temperature: { type: Number },
        duration: { type: Number }, // in minutes
        severity: { type: String, enum: ['minor', 'moderate', 'critical'] }
    }],
    qualityCheckPassed: { 
        type: Boolean 
    },
    inspectionNotes: { 
        type: String 
    },
    // Regulatory information
    regulatoryDocuments: [{
        documentType: { type: String },
        documentNumber: { type: String },
        issuedBy: { type: String },
        issuedDate: { type: Date },
        documentUrl: { type: String }
    }],
    // Blockchain information
    transactionHash: { 
        type: String 
    },
    // Environmental conditions during transfer
    temperature: { 
        type: Number 
    },
    humidity: { 
        type: Number 
    },
    conditions: { 
        type: String 
    },
    // Additional information
    notes: { 
        type: String 
    },
    initiatedAt: { 
        type: Date, 
        default: Date.now 
    },
    completedAt: { 
        type: Date 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transfer', transferSchema);