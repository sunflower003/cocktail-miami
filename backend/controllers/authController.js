const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Tạo JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Tạo mã xác thực 6 số
const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, phone, gender, age, address } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Tạo mã xác thực và thời gian hết hạn (10 phút)
        const verificationToken = generateVerificationCode();
        const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Tạo user mới - LUÔN LUÔN chưa verify email
        const user = new User({
            name,
            email,
            passwordHash,
            phone,
            gender,
            age,
            address,
            verificationToken,
            verificationTokenExpires,
            isEmailVerified: false // Luôn luôn false, bắt buộc phải verify
        });

        await user.save();

        // Luôn luôn cố gắng gửi email
        let emailSent = false;
        let emailError = null;
        
        try {
            const emailSubject = 'Email Verification - Cocktail Miami';
            const emailHtml = `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #333; margin: 0;">Welcome to Cocktail Miami!</h1>
                            <p style="color: #666; margin: 10px 0;">Thank you for registering with us</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                                Please use the verification code below to verify your email address:
                            </p>
                            
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 20px 0;">
                                <div style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${verificationToken}
                                </div>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                This code will expire in <strong>10 minutes</strong>
                            </p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
                            <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
                                If you didn't request this verification, please ignore this email.
                            </p>
                        </div>
                    </div>
                </div>
            `;

            await sendEmail(email, emailSubject, `Your verification code is: ${verificationToken}`, emailHtml);
            emailSent = true;
            console.log('✅ Verification email sent successfully to:', email);
        } catch (error) {
            emailError = error.message;
            console.error('⚠️ Email sending failed:', error.message);
            if (error.response) {
                console.error('SendGrid error details:', error.response.body);
            }
        }

        res.status(201).json({
            success: true,
            message: emailSent 
                ? 'User registered successfully. Please check your email for verification code.'
                : `User registered successfully. Email sending failed (${emailError}). Please use the resend feature.`,
            data: {
                userId: user._id,
                email: user.email,
                name: user.name,
                isEmailVerified: user.isEmailVerified,
                emailSent
                // BỎ phần verificationCode - Không show mã cho user
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user và include password để so sánh
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Kiểm tra tài khoản có bị khóa không
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact support.'
            });
        }

        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Kiểm tra email đã được verify chưa - BẮT BUỘC
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                requireEmailVerification: true,
                email: user.email
            });
        }

        // Cập nhật thời gian đăng nhập cuối
        user.lastLogin = new Date();
        await user.save();

        // Tạo JWT token
        const token = generateToken(user._id, user.role);

        // Trả về thông tin user (không bao gồm password)
        const userData = user.toJSON();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userData,
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { email, verificationToken } = req.body;

        const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpires');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Kiểm tra mã xác thực và thời gian hết hạn
        if (user.verificationToken !== verificationToken) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        if (user.verificationTokenExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        // Cập nhật trạng thái xác thực
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully! You can now login.',
            data: {
                userId: user._id,
                email: user.email,
                isEmailVerified: true
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Tạo mã xác thực mới
        const verificationToken = generateVerificationCode();
        const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await user.save();

        // Luôn luôn cố gắng gửi email
        let emailSent = false;
        let emailError = null;
        
        try {
            const emailSubject = 'New Email Verification Code - Cocktail Miami';
            const emailHtml = `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #333; margin: 0;">New Verification Code</h1>
                            <p style="color: #666; margin: 10px 0;">Here's your new verification code</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 20px 0;">
                                <div style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${verificationToken}
                                </div>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                This code will expire in <strong>10 minutes</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `;

            await sendEmail(email, emailSubject, `Your new verification code is: ${verificationToken}`, emailHtml);
            emailSent = true;
            console.log('✅ New verification email sent successfully to:', email);
        } catch (error) {
            emailError = error.message;
            console.error('⚠️ Resend email failed:', error.message);
            if (error.response) {
                console.error('SendGrid error details:', error.response.body);
            }
        }

        res.json({
            success: true,
            message: emailSent
                ? 'New verification code sent to your email'
                : `New verification code generated. Email sending failed (${emailError}).`,
            data: {
                email: user.email,
                emailSent
                // BỎ phần verificationCode - Không show mã cho user
            }
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.toJSON()
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    resendVerification,
    getMe,
    logout
};