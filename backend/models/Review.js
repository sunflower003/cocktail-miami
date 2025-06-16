const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        required: [true, 'Review title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    adminReply: {
        type: String,
        trim: true,
        maxlength: [500, 'Admin reply cannot exceed 500 characters']
    },
    helpfulVotes: {
        yes: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }],
        no: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }]
    }
}, {
    timestamps: true
});

// Compound index để đảm bảo user chỉ review 1 lần cho mỗi sản phẩm
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);