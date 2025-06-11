import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateProduct() {
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
        tags: ''
    });

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [backgroundImages, setBackgroundImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        document.title = 'Create Product - Admin Panel';
        fetchCategories();
    }, []); // ✅ Thêm dependency array rỗng

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('🚀 Starting product creation...');
            
            const formDataToSend = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                console.log(`📝 Adding field: ${key} =`, value);
                formDataToSend.append(key, value);
            });

            // Append images
            images.forEach((image, index) => {
                console.log(`📸 Adding product image ${index + 1}:`, image.name);
                formDataToSend.append('images', image);
            });

            backgroundImages.forEach((image, index) => {
                console.log(`🖼️ Adding background image ${index + 1}:`, image.name);
                formDataToSend.append('backgroundImages', image);
            });

            const token = localStorage.getItem('token');
            console.log('🔑 Token exists:', !!token);
            console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }

            console.log(`📡 Making POST request to: ${API_URL}/api/products`);

            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type for FormData, let browser set it
                },
                body: formDataToSend
            });

            console.log('📨 Response status:', response.status);
            console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('📨 Response data:', data);

            if (response.ok && data.success) {
                setSuccess('Product created successfully!');
                console.log('✅ Product created successfully');
                
                // Reset form
                setFormData({
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
                    tags: ''
                });
                setImages([]);
                setBackgroundImages([]);

                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate('/admin/products');
                }, 2000);
            } else {
                console.error('❌ Product creation failed:', data);
                setError(data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-600">Add a new product to your catalog</p>
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

                    {/* Images */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'images')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Upload multiple product images (max 10)
                                </p>
                                {images.length > 0 && (
                                    <p className="text-sm text-green-600 mt-1">
                                        {images.length} file(s) selected
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Background Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'backgroundImages')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Upload background images (max 5)
                                </p>
                                {backgroundImages.length > 0 && (
                                    <p className="text-sm text-green-600 mt-1">
                                        {backgroundImages.length} file(s) selected
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Options</h3>
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
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </div>
                            ) : (
                                'Create Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}