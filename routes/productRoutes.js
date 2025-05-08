const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');

// Create a new product - only manufacturers and admins can create products
router.post('/', auth, authorize('manufacturer', 'admin'), productController.createProduct);

// Get all products - all authenticated users can view products
router.get('/', auth, productController.getProducts);

// Get a specific product by ID - all authenticated users can view products
router.get('/:id', auth, productController.getProductById);

// Get product history - all authenticated users can view product history
router.get('/:id/history', auth, productController.getProductHistory);

// Update product status - only distributors, retailers, and admins can update status
router.put('/:id/status', auth, authorize('distributor', 'retailer', 'admin'), productController.updateProductStatus);

// Delete a product - only admins can delete products
router.delete('/:id', auth, authorize('admin'), productController.deleteProduct);

module.exports = router;