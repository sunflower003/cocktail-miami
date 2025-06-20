const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // ✅ GIỮ UNIQUE
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        // ❌ BỎ index: true
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Gender is required']
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    address: {
        type: String,
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        select: false
    },
    verificationTokenExpires: {
        type: Date,
        select: false
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    profileImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// ✅ CHỈ GIỮ CÁC INDEX CẦN THIẾT - BỎ email vì đã có unique: true
// userSchema.index({ email: 1 }); // ❌ BỎ DÒNG NÀY
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Ẩn các trường nhạy cảm khi convert sang JSON
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.passwordHash;
    delete user.verificationToken;
    delete user.verificationTokenExpires;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    return user;
};

module.exports = mongoose.model('User', userSchema);