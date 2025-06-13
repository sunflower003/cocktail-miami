const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { SHIPPING_CONFIG, PAYMENT_CONFIG } = require('../utils/constants');

// Import PayOS với error handling
let payOS = null;
try {
    payOS = require('../config/payos');
    console.log('🔍 PayOS module loaded:', payOS ? 'SUCCESS' : 'FAILED');
} catch (error) {
    console.error('❌ PayOS module import error:', error.message);
}

// ✅ HELPER FUNCTIONS - CLEAN AND ORGANIZED
const calculateOrderTotals = (orderItems) => {
    const totalPrice = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingFee = totalPrice >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CONFIG.SHIPPING_FEE;
    const tax = Math.round(totalPrice * SHIPPING_CONFIG.TAX_RATE * 100) / 100;
    const finalTotal = totalPrice + shippingFee + tax;

    return { totalPrice, shippingFee, tax, finalTotal };
};

const generateOrderCode = () => {
    return parseInt(Date.now().toString().slice(-PAYMENT_CONFIG.PAYOS_ORDER_CODE_LENGTH));
};

const convertToVND = (usdAmount) => {
    return Math.round(usdAmount * PAYMENT_CONFIG.EXCHANGE_RATE);
};

const validateOrderItems = async (items, useCartItems, userId) => {
    let orderItems = [];

    if (useCartItems) {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        for (const cartItem of cart.items) {
            const product = cartItem.productId;
            
            if (!product) {
                throw new Error('Product not found in cart');
            }

            if (product.stock < cartItem.quantity) {
                throw new Error(`${product.name} only has ${product.stock} items in stock`);
            }

            orderItems.push({
                product: product._id,
                quantity: cartItem.quantity,
                price: product.price,
                name: product.name
            });
        }
    } else {
        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                throw new Error('Product not found');
            }

            if (product.stock < item.quantity) {
                throw new Error(`${product.name} only has ${product.stock} items in stock`);
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                name: product.name
            });
        }
    }

    return orderItems;
};

const updateProductStock = async (orderItems) => {
    for (const item of orderItems) {
        try {
            const product = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
            console.log(`📦 Updated ${item.name}: ${product?.stock || 'not found'} remaining`);
        } catch (stockError) {
            console.error(`❌ Stock update failed for ${item.name}:`, stockError);
        }
    }
};

const clearUserCart = async (userId) => {
    await Cart.findOneAndUpdate(
        { userId },
        { items: [], totalAmount: 0, totalItems: 0 }
    );
};

// ✅ MAIN CONTROLLER FUNCTIONS
const handlePayOSWebhook = async (req, res) => {
    try {
        // ✅ Giảm logging, tăng tốc processing
        const webhookData = req.body;
        let orderCode, status, transactionId;
        
        if (webhookData.data) {
            const data = webhookData.data;
            orderCode = data.orderCode;
            
            if (webhookData.code === "00" && webhookData.desc === "success") {
                status = "PAID";
            } else {
                status = "FAILED";
            }
            
            transactionId = data.reference || data.paymentLinkId;
        } else {
            return res.status(200).json({ success: true });
        }

        if (!orderCode) {
            return res.status(200).json({ success: true });
        }

        // ✅ Sử dụng findOneAndUpdate để atomic operation
        const updateData = status === 'PAID' ? {
            isPaid: true,
            paidAt: new Date(),
            status: 'processing',
            'paymentInfo.payosStatus': 'PAID',
            'paymentInfo.payosTransactionId': transactionId
        } : {
            status: 'cancelled',
            'paymentInfo.payosStatus': 'FAILED'
        };

        const order = await Order.findOneAndUpdate(
            { 
                'paymentInfo.payosOrderCode': orderCode.toString(),
                isPaid: false // Chỉ update nếu chưa paid
            },
            updateData,
            { new: true }
        );

        if (order && status === 'PAID') {
            // ✅ Update stock sau khi đã update order
            await updateProductStock(order.items);
            console.log(`✅ Order ${order._id} processed successfully`);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('❌ PayOS webhook error:', error);
        res.status(200).json({ success: true }); // Luôn trả 200 để PayOS không retry
    }
};

const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, useCartItems = true } = req.body;
        const userId = req.user.userId;

        console.log('🛒 Order creation started:', { paymentMethod, payOSAvailable: !!payOS });

        if (paymentMethod === 'payos' && !payOS) {
            return res.status(400).json({
                success: false,
                message: 'PayOS payment is currently unavailable. Please use Cash on Delivery.',
                fallback: 'cod'
            });
        }

        const orderItems = await validateOrderItems(items, useCartItems, userId);
        const { totalPrice, shippingFee, tax } = calculateOrderTotals(orderItems);

        const order = new Order({
            user: userId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            shippingFee,
            tax
        });

        await order.save();
        console.log('📦 Order created:', order._id);

        if (paymentMethod === 'payos' && payOS) {
            try {
                const orderCode = generateOrderCode();
                const amountVND = convertToVND(order.finalTotal);
                
                const paymentData = {
                    orderCode: orderCode,
                    amount: amountVND,
                    description: `Order #${orderCode}`,
                    items: orderItems.map(item => ({
                        name: item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name,
                        quantity: item.quantity,
                        price: convertToVND(item.price)
                    })),
                    returnUrl: `${process.env.FRONTEND_URL}/order-success/${order._id}`,
                    cancelUrl: `${process.env.FRONTEND_URL}/order-cancelled/${order._id}`,
                    // ✅ THÊM CÁC OPTION ĐỂ TĂNG TỐC
                    expiredAt: Math.floor(Date.now() / 1000) + (30 * 60), // 30 phút hết hạn
                    signature: undefined // PayOS sẽ tự tạo
                };

                const paymentLink = await payOS.createPaymentLink(paymentData);
                
                order.paymentInfo = {
                    payosOrderCode: orderCode.toString(),
                    payosPaymentLinkId: paymentLink.id,
                    payosStatus: 'PENDING'
                };
                await order.save();

                if (useCartItems) {
                    await clearUserCart(userId);
                }

                return res.status(201).json({
                    success: true,
                    message: 'Order created successfully with PayOS payment',
                    data: {
                        order,
                        paymentUrl: paymentLink.checkoutUrl,
                        qrCode: paymentLink.qrCode,
                        orderCode: orderCode
                    }
                });

            } catch (paymentError) {
                console.error('❌ PayOS payment creation error:', paymentError);
                await Order.findByIdAndDelete(order._id);
                
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create PayOS payment',
                    error: paymentError.message
                });
            }
        }

        if (paymentMethod === 'cod') {
            await updateProductStock(orderItems);
            
            if (useCartItems) {
                await clearUserCart(userId);
            }

            return res.status(201).json({
                success: true,
                message: 'Order created successfully with COD payment',
                data: { order }
            });
        }

    } catch (error) {
        console.error('❌ Create order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

const getShippingConfig = async (req, res) => {
    res.json({
        success: true,
        data: SHIPPING_CONFIG
    });
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const orders = await Order.find({ user: userId })
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const order = await Order.findOne({ _id: id, user: userId })
            .populate('items.product', 'name images slug')
            .populate('user', 'name email');

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
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createOrder,
    handlePayOSWebhook,
    getUserOrders,
    getOrder,
    getShippingConfig
};