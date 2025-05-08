const User = require('../models/User');

const userController = {
    register: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }
            
            // Create new user
            const user = new User({
                name,
                email,
                password,
                role: role || 'customer' // Default to customer if no role provided
            });
            
            await user.save();
            
            // Generate token
            const token = await user.generateAuthToken();
            
            res.status(201).json({ user, token });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                message: 'Error registering user',
                error: error.message
            });
        }
    },
    
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Find user by credentials
            const user = await User.findByCredentials(email, password);
            
            // Generate token
            const token = await user.generateAuthToken();
            
            res.json({ user, token });
        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                message: 'Invalid login credentials',
                error: error.message
            });
        }
    },
    
    logout: async (req, res) => {
        try {
            // Remove current token
            req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
            await req.user.save();
            
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                message: 'Error logging out',
                error: error.message
            });
        }
    },
    
    logoutAll: async (req, res) => {
        try {
            // Remove all tokens
            req.user.tokens = [];
            await req.user.save();
            
            res.json({ message: 'Logged out from all devices successfully' });
        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({
                message: 'Error logging out from all devices',
                error: error.message
            });
        }
    },
    
    getProfile: async (req, res) => {
        res.json(req.user);
    },
    
    updateProfile: async (req, res) => {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }
        
        try {
            updates.forEach(update => req.user[update] = req.body[update]);
            await req.user.save();
            
            res.json(req.user);
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                message: 'Error updating profile',
                error: error.message
            });
        }
    },
    
    // Admin only - get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({});
            res.json(users);
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                message: 'Error fetching users',
                error: error.message
            });
        }
    },
    
    // Admin only - update user role
    updateUserRole: async (req, res) => {
        try {
            const { userId, role } = req.body;
            
            if (!['admin', 'manufacturer', 'distributor', 'retailer', 'customer'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            user.role = role;
            await user.save();
            
            res.json(user);
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({
                message: 'Error updating user role',
                error: error.message
            });
        }
    }
};

module.exports = userController;