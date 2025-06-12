const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRole
} = require('../controllers/adminController');

// Protect all routes and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);

module.exports = router;