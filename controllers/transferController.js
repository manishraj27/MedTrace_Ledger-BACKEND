const Transfer = require('../models/Transfer');
const Product = require('../models/Product');
const User = require('../models/User');
const { contract, account, web3 } = require('../utils/blockchain');

const transferController = {
    initiateTransfer: async (req, res) => {
        try {
            const { productId, receiverId, temperature, notes } = req.body;
            
            // Verify product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            // Verify current user is the owner
            if (product.currentOwner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You are not the current owner of this product' });
            }
            
            // Verify receiver exists
            const receiver = await User.findById(receiverId);
            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }
            
            // Generate transfer ID
            const transferId = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // Create transfer in database
            const transfer = new Transfer({
                transferId,
                productId: product._id,
                sender: req.user._id,
                senderWallet: req.body.senderWallet,
                receiver: receiver._id,
                receiverWallet: req.body.receiverWallet,
                status: 'initiated',
                temperature,
                notes,
                initiatedAt: new Date()
            });
            
            // If blockchain transaction hash is provided, save it
            if (req.body.transactionHash) {
                transfer.transactionHash = req.body.transactionHash;
            }
            
            await transfer.save();
            
            // Update product status
            product.status = 'ShippedToDistributor';
            if (receiver.role === 'retailer') {
                product.status = 'ShippedToRetailer';
            }
            
            // Add to transfer history
            product.transferHistory.push({
                transfer: transfer._id,
                timestamp: new Date()
            });
            
            await product.save();
            
            res.status(201).json({
                message: 'Transfer initiated successfully',
                transfer
            });
        } catch (error) {
            console.error('Error initiating transfer:', error);
            res.status(500).json({
                message: 'Error initiating transfer',
                error: error.message
            });
        }
    },
    
    completeTransfer: async (req, res) => {
        try {
            const { transferId, transactionHash } = req.body;
            
            // Find transfer
            const transfer = await Transfer.findOne({ transferId });
            if (!transfer) {
                return res.status(404).json({ message: 'Transfer not found' });
            }
            
            // Verify receiver is current user
            if (transfer.receiver.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Only the receiver can complete this transfer' });
            }
            
            // Verify transfer is not already completed
            if (transfer.status === 'completed') {
                return res.status(400).json({ message: 'Transfer already completed' });
            }
            
            // Update transfer
            transfer.status = 'completed';
            transfer.completedAt = new Date();
            if (transactionHash) {
                transfer.transactionHash = transactionHash;
            }
            
            await transfer.save();
            
            // Update product ownership and status
            const product = await Product.findById(transfer.productId);
            product.currentOwner = req.user._id;
            product.currentOwnerWallet = req.body.receiverWallet;
            
            if (req.user.role === 'distributor') {
                product.status = 'ReceivedByDistributor';
            } else if (req.user.role === 'retailer') {
                product.status = 'ReceivedByRetailer';
            } else if (req.user.role === 'customer') {
                product.status = 'Sold';
            }
            
            await product.save();
            
            res.json({
                message: 'Transfer completed successfully',
                transfer
            });
        } catch (error) {
            console.error('Error completing transfer:', error);
            res.status(500).json({
                message: 'Error completing transfer',
                error: error.message
            });
        }
    },
    
    getTransfers: async (req, res) => {
        try {
            // Get transfers where user is sender or receiver
            const transfers = await Transfer.find({
                $or: [
                    { sender: req.user._id },
                    { receiver: req.user._id }
                ]
            })
            .populate('productId')
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .sort({ initiatedAt: -1 });
            
            res.json(transfers);
        } catch (error) {
            console.error('Error fetching transfers:', error);
            res.status(500).json({
                message: 'Error fetching transfers',
                error: error.message
            });
        }
    },
    
    getTransferById: async (req, res) => {
        try {
            const transfer = await Transfer.findOne({ transferId: req.params.id })
                .populate('productId')
                .populate('sender', 'name email role')
                .populate('receiver', 'name email role');
                
            if (!transfer) {
                return res.status(404).json({ message: 'Transfer not found' });
            }
            
            res.json(transfer);
        } catch (error) {
            console.error('Error fetching transfer:', error);
            res.status(500).json({
                message: 'Error fetching transfer',
                error: error.message
            });
        }
    }
};

module.exports = transferController;