const Shipment = require('../models/Shipment');
const Product = require('../models/Product');
const User = require('../models/User');
const Location = require('../models/Location');
const { contract, account, web3 } = require('../utils/blockchain');

const shipmentController = {
    createShipment: async (req, res) => {
        try {
            const { 
                productIds, 
                receiverId, 
                origin, 
                destination, 
                carrier, 
                shipmentType,
                expectedDeliveryDate,
                temperatureMonitoring,
                conditions,
                notes,
                transactionHash
            } = req.body;
            
            // Verify products exist and user owns them
            const products = await Product.find({ _id: { $in: productIds } });
            if (products.length !== productIds.length) {
                return res.status(404).json({ message: 'One or more products not found' });
            }
            
            // Check ownership
            for (const product of products) {
                if (product.currentOwner.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ 
                        message: `You don't own product ${product.name} (${product._id})` 
                    });
                }
            }
            
            // Verify receiver exists
            const receiver = await User.findById(receiverId);
            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }
            
            // Generate shipment ID
            const shipmentId = `SHP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // Create shipment
            const shipment = new Shipment({
                shipmentId,
                products: productIds,
                sender: req.user._id,
                senderWallet: req.body.senderWallet,
                receiver: receiver._id,
                receiverWallet: req.body.receiverWallet,
                origin,
                destination,
                carrier,
                status: 'created',
                shipmentType,
                expectedDeliveryDate,
                temperatureMonitoring,
                conditions,
                notes,
                transactionHash
            });
            
            await shipment.save();
            
            // Update product status
            const newStatus = receiver.role === 'distributor' ? 
                'ShippedToDistributor' : 'ShippedToRetailer';
                
            await Product.updateMany(
                { _id: { $in: productIds } },
                { 
                    $set: { status: newStatus },
                    $push: { 
                        locationHistory: {
                            location: origin.locationId,
                            timestamp: new Date(),
                            temperature: conditions?.temperature?.target || null
                        }
                    }
                }
            );
            
            res.status(201).json({
                message: 'Shipment created successfully',
                shipment
            });
        } catch (error) {
            console.error('Error creating shipment:', error);
            res.status(500).json({
                message: 'Error creating shipment',
                error: error.message
            });
        }
    },
    
    updateShipmentStatus: async (req, res) => {
        try {
            const { shipmentId } = req.params;
            const { status, actualDeliveryDate, transactionHash, temperatureReadings } = req.body;
            
            // Find shipment
            const shipment = await Shipment.findOne({ shipmentId });
            if (!shipment) {
                return res.status(404).json({ message: 'Shipment not found' });
            }
            
            // Check permissions
            const isReceiver = shipment.receiver.toString() === req.user._id.toString();
            const isSender = shipment.sender.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'admin';
            
            if (!isReceiver && !isSender && !isAdmin) {
                return res.status(403).json({ 
                    message: 'You are not authorized to update this shipment' 
                });
            }
            
            // Update shipment
            shipment.status = status || shipment.status;
            
            if (status === 'delivered' && isReceiver) {
                shipment.actualDeliveryDate = actualDeliveryDate || new Date();
                
                // Transfer ownership of products to receiver
                await Product.updateMany(
                    { _id: { $in: shipment.products } },
                    { 
                        $set: { 
                            currentOwner: shipment.receiver,
                            currentOwnerWallet: shipment.receiverWallet,
                            status: req.user.role === 'distributor' ? 
                                'ReceivedByDistributor' : 'ReceivedByRetailer'
                        },
                        $push: { 
                            locationHistory: {
                                location: shipment.destination.locationId,
                                timestamp: new Date(),
                                temperature: shipment.conditions?.temperature?.target || null
                            }
                        }
                    }
                );
            }
            
            // Add temperature readings if provided
            if (temperatureReadings && Array.isArray(temperatureReadings)) {
                shipment.temperatureReadings.push(...temperatureReadings);
            }
            
            // Add blockchain transaction hash if provided
            if (transactionHash) {
                shipment.transactionHash = transactionHash;
            }
            
            await shipment.save();
            
            res.json({
                message: 'Shipment updated successfully',
                shipment
            });
        } catch (error) {
            console.error('Error updating shipment:', error);
            res.status(500).json({
                message: 'Error updating shipment',
                error: error.message
            });
        }
    },
    
    getShipments: async (req, res) => {
        try {
            // Get shipments where user is sender or receiver
            const shipments = await Shipment.find({
                $or: [
                    { sender: req.user._id },
                    { receiver: req.user._id }
                ]
            })
            .populate('products')
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .sort({ createdAt: -1 });
            
            res.json(shipments);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            res.status(500).json({
                message: 'Error fetching shipments',
                error: error.message
            });
        }
    },
    
    getShipmentById: async (req, res) => {
        try {
            const shipment = await Shipment.findOne({ shipmentId: req.params.id })
                .populate('products')
                .populate('sender', 'name email role')
                .populate('receiver', 'name email role');
                
            if (!shipment) {
                return res.status(404).json({ message: 'Shipment not found' });
            }
            
            res.json(shipment);
        } catch (error) {
            console.error('Error fetching shipment:', error);
            res.status(500).json({
                message: 'Error fetching shipment',
                error: error.message
            });
        }
    }
};

module.exports = shipmentController;