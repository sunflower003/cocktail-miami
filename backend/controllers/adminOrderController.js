const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all orders with filters and pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            isPaid,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minTotal,
            maxTotal,
            startDate,
            endDate
        } = req.query;

        // Build filter object
        const filter = {};

        // Search by email or order ID
        if (search) {
            if (search.match(/^[0-9a-fA-F]{24}$/)) {
                filter._id = search;
            } else {
                const users = await User.find({
                    email: { $regex: search, $options: 'i' }
                }).select('_id');
                
                if (users.length > 0) {
                    filter.user = { $in: users.map(user => user._id) };
                }
            }
        }

        // Filter by status
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Filter by payment status
        if (isPaid !== undefined && isPaid !== 'all') {
            filter.isPaid = isPaid === 'true';
        }

        // Filter by total amount range
        if (minTotal || maxTotal) {
            filter.totalPrice = {};
            if (minTotal) filter.totalPrice.$gte = parseFloat(minTotal);
            if (maxTotal) filter.totalPrice.$lte = parseFloat(maxTotal);
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get orders with populate
        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images slug')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Order.countDocuments(filter);

        // ✅ Calculate stats - CHỈ TÍNH PAID ORDERS
        const stats = await Order.aggregate([
            { $match: filter },
            {
                $addFields: {
                    finalTotal: {
                        $add: ['$totalPrice', '$shippingFee', '$tax']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { 
                        $sum: {
                            $cond: [
                                { $eq: ['$isPaid', true] }, // ✅ CHỈ TÍNH ORDERS ĐÃ THANH TOÁN
                                '$finalTotal',
                                0
                            ]
                        }
                    },
                    averageOrderValue: { $avg: '$finalTotal' },
                    totalOrders: { $sum: 1 },
                    paidOrders: { 
                        $sum: { $cond: ['$isPaid', 1, 0] } 
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalOrders: total,
                    hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
                    hasPrev: parseInt(page) > 1
                },
                stats: stats[0] || {
                    totalRevenue: 0,
                    averageOrderValue: 0,
                    totalOrders: 0,
                    paidOrders: 0
                }
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get single order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user', 'name email phone gender createdAt lastLogin')
            .populate('items.product', 'name images slug description price stock');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isPaid, notes } = req.body;

        const updateData = {};
        
        if (status) {
            updateData.status = status;
        }
        
        if (isPaid !== undefined) {
            updateData.isPaid = isPaid;
            if (isPaid && !updateData.paidAt) {
                updateData.paidAt = new Date();
            }
        }
        
        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await Order.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const stats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $addFields: {
                    finalTotal: {
                        $add: ['$totalPrice', '$shippingFee', '$tax']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { 
                        $sum: {
                            $cond: [
                                { $eq: ['$isPaid', true] },
                                '$finalTotal',
                                0
                            ]
                        }
                    },
                    averageOrderValue: { $avg: '$finalTotal' },
                    paidOrders: { 
                        $sum: { $cond: ['$isPaid', 1, 0] } 
                    },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    processingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
                    },
                    shippedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get daily revenue for chart
        const dailyStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    isPaid: true
                }
            },
            {
                $addFields: {
                    finalTotal: {
                        $add: ['$totalPrice', '$shippingFee', '$tax']
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    revenue: { $sum: '$finalTotal' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {},
                dailyStats
            }
        });

    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
};