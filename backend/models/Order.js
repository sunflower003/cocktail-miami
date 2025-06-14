const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        company: String,
        address: { type: String, required: true },
        apartment: String,
        city: { type: String, required: true },
        state: { type: String, required: false }, // ✅ BỎ REQUIRED
        zipCode: { type: String, required: true },
        phone: { type: String, required: true },
        country: { type: String, default: 'Vietnam' } // ✅ CHANGE DEFAULT
    },
    paymentMethod: {
        type: String,
        enum: ['payos', 'cod'],
        required: true
    },
    paymentInfo: {
        payosOrderCode: String,
        payosTransactionId: String,
        payosPaymentLinkId: String,
        payosStatus: String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    discountCode: String,
    discountAmount: {
        type: Number,
        default: 0
    },
    notes: String
}, {
    timestamps: true
});

// ✅ Calculate final total correctly
orderSchema.virtual('finalTotal').get(function() {
    const subtotal = this.totalPrice || 0;
    const shipping = this.shippingFee || 0;
    const tax = this.tax || 0;
    const discount = this.discountAmount || 0;
    
    return Math.round((subtotal + shipping + tax - discount) * 100) / 100;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);