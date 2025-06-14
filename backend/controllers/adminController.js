const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');
const { deleteImage } = require('../config/cloudinary');

// ====================================
// PRODUCT MANAGEMENT
// ====================================

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};
        
        if (req.query.category) {
            filter.category = req.query.category;
        }
        
        if (req.query.featured !== undefined) {
            filter.isFeatured = req.query.featured === 'true';
        }

        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: products,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get single product for admin
// @route   GET /api/admin/products/:id
// @access  Private/Admin
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const {
            name, description, subDescription, price, company,
            category, stock, abv, color, country, region, isFeatured, tags
        } = req.body;

        const images = [];
        const backgroundImages = [];

        if (req.files) {
            if (req.files.images) {
                req.files.images.forEach(file => {
                    images.push({
                        url: file.path,
                        publicId: file.filename
                    });
                });
            }

            if (req.files.backgroundImages) {
                req.files.backgroundImages.forEach(file => {
                    backgroundImages.push({
                        url: file.path,
                        publicId: file.filename
                    });
                });
            }
        }

        const product = await Product.create({
            name, description, subDescription,
            price: parseFloat(price), company, category, images,
            stock: parseInt(stock), abv: abv ? parseFloat(abv) : undefined,
            color, country, region, isFeatured: isFeatured === 'true',
            backgroundImages, tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const {
            name, description, subDescription, price, company,
            category, stock, abv, color, country, region, isFeatured,
            tags, removeImages, removeBackgroundImages
        } = req.body;

        // Remove specified images
        if (removeImages) {
            const imagesToRemove = JSON.parse(removeImages);
            for (const publicId of imagesToRemove) {
                await deleteImage(publicId);
                product.images = product.images.filter(img => img.publicId !== publicId);
            }
        }

        if (removeBackgroundImages) {
            const backgroundImagesToRemove = JSON.parse(removeBackgroundImages);
            for (const publicId of backgroundImagesToRemove) {
                await deleteImage(publicId);
                product.backgroundImages = product.backgroundImages.filter(img => img.publicId !== publicId);
            }
        }

        // Add new images
        if (req.files) {
            if (req.files.images) {
                req.files.images.forEach(file => {
                    product.images.push({
                        url: file.path,
                        publicId: file.filename
                    });
                });
            }

            if (req.files.backgroundImages) {
                req.files.backgroundImages.forEach(file => {
                    product.backgroundImages.push({
                        url: file.path,
                        publicId: file.filename
                    });
                });
            }
        }

        // Update fields
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (subDescription !== undefined) product.subDescription = subDescription;
        if (price !== undefined) product.price = parseFloat(price);
        if (company !== undefined) product.company = company;
        if (category !== undefined) product.category = category;
        if (stock !== undefined) product.stock = parseInt(stock);
        if (abv !== undefined) product.abv = abv ? parseFloat(abv) : undefined;
        if (color !== undefined) product.color = color;
        if (country !== undefined) product.country = country;
        if (region !== undefined) product.region = region;
        if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true';
        if (tags !== undefined) product.tags = tags.split(',').map(tag => tag.trim());

        await product.save();

        const updatedProduct = await Product.findById(product._id)
            .populate('category', 'name');

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete all images from Cloudinary
        for (const image of product.images) {
            await deleteImage(image.publicId);
        }

        for (const backgroundImage of product.backgroundImages) {
            await deleteImage(backgroundImage.publicId);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ====================================
// CATEGORY MANAGEMENT
// ====================================

// @desc    Get all categories for admin
// @route   GET /api/admin/categories
// @access  Private/Admin
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get single category
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = await Category.create({ name, description });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, isActive },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const productsCount = await Product.countDocuments({ category: req.params.id });
        
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It is being used by ${productsCount} product(s)`
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ====================================
// DASHBOARD STATS
// ====================================

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalProducts,
            totalCategories,
            totalUsers,
            totalOrders,
            recentProducts
        ] = await Promise.all([
            Product.countDocuments(),
            Category.countDocuments(),
            User.countDocuments(),
            Order.countDocuments(),
            Product.find()
                .populate('category', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                totalCategories,
                totalUsers,
                totalOrders,
                recentProducts
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
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
    
    // Dashboard
    getDashboardStats
};