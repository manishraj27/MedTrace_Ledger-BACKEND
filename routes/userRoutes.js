const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.post('/logout', auth, userController.logout);
router.post('/logoutAll', auth, userController.logoutAll);
router.get('/profile', auth, userController.getProfile);
router.patch('/profile', auth, userController.updateProfile);

// Admin only routes
router.get('/all', auth, authorize('admin'), userController.getAllUsers);
router.patch('/role', auth, authorize('admin'), userController.updateUserRole);

module.exports = router;