import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
        }`}>
            <div className="flex items-center gap-3">
                {type === 'success' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                <span className="font-medium">{message}</span>
                <button 
                    onClick={onClose}
                    className="ml-2 hover:opacity-80"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        subDescription: '',
        price: '',
        company: '',
        category: '',
        stock: '',
        abv: '',
        color: '',
        country: '',
        region: '',
        isFeatured: false,
        tags: '',
        isActive: true
    });

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [backgroundImages, setBackgroundImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [existingBackgroundImages, setExistingBackgroundImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [backgroundImagesToDelete, setBackgroundImagesToDelete] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Toast notification state
    const [toast, setToast] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Show toast notification
    const showToast = (message, type) => {
        setToast({ message, type });
    };

    // Close toast notification
    const closeToast = () => {
        setToast(null);
    };

    useEffect(() => {
        document.title = 'Edit Product - Admin Panel';
        fetchProduct();
        fetchCategories();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                const product = data.data;
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    subDescription: product.subDescription || '',
                    price: product.price || '',
                    company: product.company || '',
                    category: product.category?._id || '',
                    stock: product.stock || '',
                    abv: product.abv || '',
                    color: product.color || '',
                    country: product.country || '',
                    region: product.region || '',
                    isFeatured: product.isFeatured || false,
                    tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
                    isActive: product.isActive !== undefined ? product.isActive : true
                });
                
                setExistingImages(product.images || []);
                setExistingBackgroundImages(product.backgroundImages || []);
            } else {
                setError(data.message || 'Product not found');
                showToast('Failed to load product', 'error');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            const errorMessage = 'Failed to load product';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories?active=true`);
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'images') {
            setImages(files);
        } else {
            setBackgroundImages(files);
        }
    };

    const handleDeleteExistingImage = (imageId, type) => {
        if (type === 'images') {
            setExistingImages(prev => prev.filter(img => img.public_id !== imageId));
            setImagesToDelete(prev => [...prev, imageId]);
        } else {
            setExistingBackgroundImages(prev => prev.filter(img => img.public_id !== imageId));
            setBackgroundImagesToDelete(prev => [...prev, imageId]);
        }
        showToast('Image marked for deletion', 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            console.log('🚀 Starting product update...');
            
            const formDataToSend = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                console.log(`📝 Adding field: ${key} =`, value);
                formDataToSend.append(key, value);
            });

            // Append new images
            images.forEach((image, index) => {
                console.log(`📸 Adding new product image ${index + 1}:`, image.name);
                formDataToSend.append('images', image);
            });

            backgroundImages.forEach((image, index) => {
                console.log(`🖼️ Adding new background image ${index + 1}:`, image.name);
                formDataToSend.append('backgroundImages', image);
            });

            // Append images to delete
            if (imagesToDelete.length > 0) {
                formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
            }
            if (backgroundImagesToDelete.length > 0) {
                formDataToSend.append('backgroundImagesToDelete', JSON.stringify(backgroundImagesToDelete));
            }

            const token = localStorage.getItem('token');
            console.log('🔑 Token exists:', !!token);

            if (!token) {
                const errorMessage = 'No authentication token found. Please login again.';
                setError(errorMessage);
                showToast(errorMessage, 'error');
                setUpdating(false);
                return;
            }

            console.log(`📡 Making PUT request to: ${API_URL}/api/products/${id}`);

            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type for FormData
                },
                body: formDataToSend
            });

            console.log('📨 Response status:', response.status);
            const data = await response.json();
            console.log('📨 Response data:', data);

            if (response.ok && data.success) {
                const successMessage = 'Product updated successfully!';
                setSuccess(successMessage);
                showToast(successMessage, 'success');
                console.log('✅ Product updated successfully');
                
                // Redirect after 3 seconds to allow user to see the toast
                setTimeout(() => {
                    navigate('/admin/products');
                }, 3000);
            } else {
                console.error('❌ Product update failed:', data);
                const errorMessage = data.message || 'Failed to update product';
                setError(errorMessage);
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            const errorMessage = 'Network error. Please check your connection and try again.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-4">{error}</div>
                <button
                    onClick={() => navigate('/admin/products')}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-600">Update product information</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company *
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price ($) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock *
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ABV (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="abv"
                                        value={formData.abv}
                                        onChange={handleChange}
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Main Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="Enter detailed product description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sub Description
                                    </label>
                                    <textarea
                                        name="subDescription"
                                        value={formData.subDescription}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="Enter sub description (optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="Enter country"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Region
                                    </label>
                                    <input
                                        type="text"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="Enter region"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                        placeholder="Enter color (e.g., #914a64)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                placeholder="Enter tags separated by commas (e.g., organic, premium, craft)"
                            />
                        </div>

                        {/* Current Images */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Images</h3>
                            
                            {/* Current Product Images */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Images
                                </label>
                                {existingImages.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {existingImages.map((image, index) => (
                                            <div key={image.public_id || index} className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={`Product ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingImage(image.public_id, 'images')}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Current Background Images */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Background Images
                                </label>
                                {existingBackgroundImages.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {existingBackgroundImages.map((image, index) => (
                                            <div key={image.public_id || index} className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={`Background ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingImage(image.public_id, 'backgroundImages')}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add New Images */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Images</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Product Images
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'images')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload additional product images
                                    </p>
                                    {images.length > 0 && (
                                        <p className="text-sm text-green-600 mt-1">
                                            {images.length} new file(s) selected
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Background Images
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'backgroundImages')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload additional background images
                                    </p>
                                    {backgroundImages.length > 0 && (
                                        <p className="text-sm text-green-600 mt-1">
                                            {backgroundImages.length} new file(s) selected
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Options</h3>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                    />
                                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                                        Featured Product (will be displayed on homepage)
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                        Active Product (visible to customers)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updating ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    'Update Product'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}