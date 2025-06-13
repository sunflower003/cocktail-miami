const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Import PayOS với error handling
let payOS = null;
try {
    payOS = require('../config/payos');
    console.log('🔍 PayOS module loaded:', payOS ? 'SUCCESS' : 'FAILED');
} catch (error) {
    console.error('❌ PayOS module import error:', error.message);
}

// @desc    Handle PayOS webhook
// @route   POST /api/orders/payos-webhook
// @access  Public (KHÔNG CẦN AUTH)
const handlePayOSWebhook = async (req, res) => {
    try {
        console.log('=== PAYOS WEBHOOK DEBUG START ===');
        console.log('📡 Time:', new Date().toISOString());
        console.log('📡 Method:', req.method);
        console.log('📡 URL:', req.url);
        console.log('📡 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('📡 Raw Body:', JSON.stringify(req.body, null, 2));
        
        const webhookData = req.body;
        let orderCode, status, transactionId;
        
        // PayOS format dựa trên log của bạn
        if (webhookData.data) {
            console.log('🔍 Using PayOS format');
            const data = webhookData.data;
            orderCode = data.orderCode;
            
            // PayOS sử dụng desc thay vì status + check code
            if (webhookData.code === "00" && webhookData.desc === "success") {
                status = "PAID"; // Map sang format chuẩn
            } else {
                status = "FAILED";
            }
            
            transactionId = data.reference || data.paymentLinkId;
        } else {
            console.log('❌ Unknown PayOS webhook format');
            return res.status(200).json({
                success: true,
                message: 'Unknown format but acknowledged'
            });
        }

        console.log('🔍 Extracted data:');
        console.log('Order Code:', orderCode, typeof orderCode);
        console.log('Status:', status, typeof status);
        console.log('Transaction ID:', transactionId, typeof transactionId);
        console.log('PayOS Code:', webhookData.code);
        console.log('PayOS Desc:', webhookData.desc);

        if (!orderCode) {
            console.log('⚠️ No orderCode found');
            return res.status(200).json({
                success: true,
                message: 'No orderCode but acknowledged'
            });
        }

        // Tìm order
        console.log('🔍 Searching for order...');
        const order = await Order.findOne({ 
            'paymentInfo.payosOrderCode': orderCode.toString() 
        });

        if (!order) {
            console.error('❌ Order not found for orderCode:', orderCode);
            
            // Debug: List recent orders
            const recentOrders = await Order.find({ 
                'paymentInfo.payosOrderCode': { $exists: true },
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }).select('_id paymentInfo.payosOrderCode createdAt');
            
            console.log('📋 Recent orders:', recentOrders.map(o => ({
                id: o._id,
                orderCode: o.paymentInfo.payosOrderCode,
                created: o.createdAt
            })));
            
            return res.status(200).json({
                success: true,
                message: 'Order not found but acknowledged'
            });
        }

        console.log('📦 Found order:', order._id);
        console.log('📦 Current status:', order.status);
        console.log('📦 Current isPaid:', order.isPaid);

        // Xử lý payment success
        if (status === 'PAID') {
            console.log('✅ Processing PayOS payment success...');
            
            if (order.isPaid) {
                console.log('⚠️ Order already paid');
                return res.status(200).json({
                    success: true,
                    message: 'Order already paid'
                });
            }
            
            // Update order
            order.isPaid = true;
            order.paidAt = new Date();
            order.status = 'processing';
            order.paymentInfo.payosStatus = 'PAID';
            order.paymentInfo.payosTransactionId = transactionId;

            console.log('📦 Updating product stock...');
            // Update stock
            for (const item of order.items) {
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

            await order.save();
            console.log(`✅ Order ${order._id} updated to PAID successfully`);
            console.log(`✅ Final: isPaid=${order.isPaid}, status=${order.status}`);
            
        } else {
            console.log('❌ Processing payment failure...');
            order.status = 'cancelled';
            order.paymentInfo.payosStatus = 'FAILED';
            await order.save();
        }

        console.log('=== PAYOS WEBHOOK DEBUG END ===');
        
        res.status(200).json({ 
            success: true,
            message: 'PayOS webhook processed successfully',
            debug: {
                orderCode,
                payosCode: webhookData.code,
                payosDesc: webhookData.desc,
                mappedStatus: status,
                orderFound: !!order,
                orderStatus: order?.status,
                isPaid: order?.isPaid
            }
        });

    } catch (error) {
        console.error('❌ PayOS webhook error:', error);
        res.status(200).json({
            success: true,
            message: 'Webhook error but acknowledged'
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        console.log('🛒 Create order called');
        
        const {
            items,
            shippingAddress,
            paymentMethod,
            useCartItems = true
        } = req.body;

        const userId = req.user.userId;

        console.log('🛒 Order creation started:');
        console.log('Payment Method:', paymentMethod);
        console.log('PayOS Available:', !!payOS);

        // KIỂM TRA PayOS availability
        if (paymentMethod === 'payos' && !payOS) {
            console.warn('⚠️ PayOS requested but not available, forcing COD');
            return res.status(400).json({
                success: false,
                message: 'PayOS payment is currently unavailable. Please use Cash on Delivery.',
                fallback: 'cod'
            });
        }

        let orderItems = [];

        if (useCartItems) {
            // Lấy items từ cart
            const cart = await Cart.findOne({ userId }).populate('items.productId');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cart is empty'
                });
            }

            // Validate stock và tạo order items
            // Debug product prices khi load items
            for (const cartItem of cart.items) {
                const product = cartItem.productId;
                
                console.log('🔍 Product Debug:', {
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock
                });
                
                if (!product) {
                    return res.status(400).json({
                        success: false,
                        message: 'Product not found in cart'
                    });
                }

                if (product.stock < cartItem.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.name} only has ${product.stock} items in stock`
                    });
                }

                // CHECK IF PRICE IS 0
                if (product.price <= 0) {
                    console.warn(`⚠️ Product ${product.name} has invalid price: ${product.price}`);
                    return res.status(400).json({
                        success: false,
                        message: `Product ${product.name} has invalid price`
                    });
                }

                orderItems.push({
                    product: product._id,
                    quantity: cartItem.quantity,
                    price: product.price, // Make sure this is > 0
                    name: product.name
                });
            }
        } else {
            // Sử dụng items được truyền vào (cho direct buy)
            for (const item of items) {
                const product = await Product.findById(item.productId);
                
                if (!product) {
                    return res.status(400).json({
                        success: false,
                        message: 'Product not found'
                    });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.name} only has ${product.stock} items in stock`
                    });
                }

                orderItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price,
                    name: product.name
                });
            }
        }

        // Tính tổng tiền với debug
        const totalPrice = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shippingFee = totalPrice >= 50 ? 0 : 0; // $10 shipping if under $50
        const tax = Math.round(totalPrice * 0.08 * 100) / 100; // 8% tax

        console.log('💰 Order Calculation Debug:');
        console.log('Items:', orderItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity, total: item.price * item.quantity })));
        console.log('Total Price (USD):', totalPrice);
        console.log('Shipping Fee (USD):', shippingFee);
        console.log('Tax (USD):', tax);
        console.log('Final Total (USD):', totalPrice + shippingFee + tax);

        // Tạo order
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
        console.log('🔍 Order Final Total:', order.finalTotal);

        // XỬ LÝ PAYOS PAYMENT
        if (paymentMethod === 'payos' && payOS) {
            try {
                console.log('💳 Creating PayOS payment...');
                
                const orderCode = parseInt(Date.now().toString().slice(-6)); // 6 digits
                
                // Convert USD to VND
                const exchangeRate = 24000; // 1 USD = 24,000 VND
                const finalTotalUSD = order.finalTotal;
                const amountVND = Math.round(finalTotalUSD * exchangeRate);
                
                console.log('💱 Currency Conversion:');
                console.log('Final Total USD:', finalTotalUSD);
                console.log('Exchange Rate:', exchangeRate);
                console.log('Amount VND:', amountVND);
                
                const paymentData = {
                    orderCode: orderCode,
                    amount: amountVND,
                    description: `Order #${orderCode}`, // ✅ RÚT GỌN CHỈ CÒN 14 KÝ TỰ
                    items: orderItems.map(item => ({
                        name: item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name, // ✅ RÚT GỌN TÊN SẢN PHẨM
                        quantity: item.quantity,
                        price: Math.round(item.price * exchangeRate)
                    })),
                    returnUrl: `${process.env.FRONTEND_URL}/order-success/${order._id}`,
                    cancelUrl: `${process.env.FRONTEND_URL}/order-cancelled/${order._id}`,
                    buyerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                    buyerEmail: req.body.email || 'customer@email.com',
                    buyerPhone: shippingAddress.phone
                };

                console.log('📊 PayOS Payment Data:', JSON.stringify(paymentData, null, 2));

                const paymentLink = await payOS.createPaymentLink(paymentData);
                
                console.log('✅ PayOS payment link created:', paymentLink.checkoutUrl);

                // Update order với PayOS info
                order.paymentInfo = {
                    payosOrderCode: orderCode.toString(),
                    payosPaymentLinkId: paymentLink.id,
                    payosStatus: 'PENDING'
                };
                await order.save();

                // Clear cart
                if (useCartItems) {
                    await Cart.findOneAndUpdate(
                        { userId },
                        { items: [], totalAmount: 0, totalItems: 0 }
                    );
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
                console.error('PayOS Error Details:', JSON.stringify(paymentError, null, 2));
                
                // Xóa order nếu PayOS thất bại
                await Order.findByIdAndDelete(order._id);
                
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create PayOS payment',
                    error: paymentError.message,
                    details: process.env.NODE_ENV === 'development' ? paymentError : undefined
                });
            }
        }

        // COD payment
        if (paymentMethod === 'cod') {
            console.log('💵 Processing COD payment...');
            
            // Update stock ngay cho COD
            for (const item of orderItems) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } }
                );
            }

            // Clear cart
            if (useCartItems) {
                await Cart.findOneAndUpdate(
                    { userId },
                    { items: [], totalAmount: 0, totalItems: 0 }
                );
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
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
    try {
        console.log('📋 Get user orders called');
        
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
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
    try {
        console.log('📄 Get single order called');
        
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
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createOrder,
    handlePayOSWebhook,
    getUserOrders,
    getOrder
};