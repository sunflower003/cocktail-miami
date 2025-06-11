const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteImage } = require('../config/cloudinary');
const mongoose = require('mongoose');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        let filter = {};
        
        if (req.query.category) {
            filter.category = req.query.category;
        }
        
        if (req.query.featured !== undefined) {
            filter.isFeatured = req.query.featured === 'true';
        }
        
        if (req.query.active !== undefined) {
            filter.isActive = req.query.active === 'true';
        }

        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        // Build sort object
        let sort = {};
        switch (req.query.sort) {
            case 'name':
                sort.name = 1;
                break;
            case 'price_low':
                sort.price = 1;
                break;
            case 'price_high':
                sort.price = -1;
                break;
            case 'rating':
                sort.averageRating = -1;
                break;
            case 'newest':
                sort.createdAt = -1;
                break;
            case 'popular':
                sort.sold = -1;
                break;
            default:
                sort.createdAt = -1;
        }

        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            count: products.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let product;

        // Check if id is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            // Try to find by ObjectId first
            product = await Product.findById(id).populate('category', 'name slug');
        }
        
        // If not found by ObjectId or id is not a valid ObjectId, try to find by slug
        if (!product) {
            product = await Product.findOne({ slug: id }).populate('category', 'name slug');
        }

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
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        console.log('🚀 Creating product...');
        console.log('📝 Request body:', req.body);
        console.log('📁 Request files:', req.files);
        
        const {
            name,
            description,
            subDescription,
            price,
            company,
            category,
            stock,
            abv,
            color,
            country,
            region,
            isFeatured,
            tags
        } = req.body;

        // Validate category exists
        console.log('🔍 Validating category:', category);
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            console.error('❌ Category not found:', category);
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }
        console.log('✅ Category found:', categoryExists.name);

        // Process images from multer upload
        const images = [];
        const backgroundImages = [];

        if (req.files) {
            console.log('📸 Processing uploaded files...');
            
            if (req.files.images) {
                console.log(`📸 Found ${req.files.images.length} product images`);
                req.files.images.forEach((file, index) => {
                    console.log(`📸 Image ${index + 1}:`, {
                        originalname: file.originalname,
                        path: file.path,
                        filename: file.filename
                    });
                    images.push({
                        url: file.path,
                        publicId: file.filename,
                        alt: name
                    });
                });
            }

            if (req.files.backgroundImages) {
                console.log(`🖼️ Found ${req.files.backgroundImages.length} background images`);
                req.files.backgroundImages.forEach((file, index) => {
                    console.log(`🖼️ Background ${index + 1}:`, {
                        originalname: file.originalname,
                        path: file.path,
                        filename: file.filename
                    });
                    backgroundImages.push({
                        url: file.path,
                        publicId: file.filename,
                        alt: `${name} background`
                    });
                });
            }
        } else {
            console.log('📁 No files uploaded');
        }

        console.log('💾 Creating product with data:', {
            name,
            price: parseFloat(price),
            company,
            category,
            stock: parseInt(stock),
            imagesCount: images.length,
            backgroundImagesCount: backgroundImages.length
        });

        const product = await Product.create({
            name,
            description,
            subDescription,
            price: parseFloat(price),
            company,
            category,
            images,
            stock: parseInt(stock),
            abv: abv ? parseFloat(abv) : undefined,
            color,
            country,
            region,
            isFeatured: isFeatured === 'true',
            backgroundImages,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        console.log('✅ Product created with ID:', product._id);

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name slug');

        console.log('✅ Product populated and ready to return');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct
        });
    } catch (error) {
        console.error('❌ Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
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
            name,
            description,
            subDescription,
            price,
            company,
            category,
            stock,
            abv,
            color,
            country,
            region,
            isFeatured,
            tags,
            removeImages,
            removeBackgroundImages
        } = req.body;

        // Validate category if provided
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
            }
        }

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
                        publicId: file.filename,
                        alt: name || product.name
                    });
                });
            }

            if (req.files.backgroundImages) {
                req.files.backgroundImages.forEach(file => {
                    product.backgroundImages.push({
                        url: file.path,
                        publicId: file.filename,
                        alt: `${name || product.name} background`
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
        if (tags !== undefined) product.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];

        await product.save();

        const updatedProduct = await Product.findById(product._id)
            .populate('category', 'name slug');

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
// @route   DELETE /api/products/:id
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

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};