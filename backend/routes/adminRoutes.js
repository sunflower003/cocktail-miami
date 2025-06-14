const express = require('express');
const { protect, authorize } = require('../middleware/auth');

// Import từ adminController (chỉ những function có sẵn)
const {
    // Product management  
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Category management
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Dashboard stats
    getDashboardStats
} = require('../controllers/adminController');

// ✅ Import từ adminUserController
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRole
} = require('../controllers/adminUserController');

// ✅ Import từ adminOrderController
const {
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} = require('../controllers/adminOrderController');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// ✅ User management routes
router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);

// Product management
router.route('/products')
    .get(getAllProducts)
    .post(createProduct);

router.route('/products/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

// Category management
router.route('/categories')
    .get(getAllCategories)
    .post(createCategory);

router.route('/categories/:id')
    .get(getCategoryById)
    .put(updateCategory)
    .delete(deleteCategory);

// ✅ Order management routes
router.get('/orders/stats', getOrderStats);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

module.exports = router;