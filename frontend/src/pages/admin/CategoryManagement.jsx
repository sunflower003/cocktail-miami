import { useState, useEffect } from 'react';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        document.title = 'Categories - Admin Panel';
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories`);
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = editingCategory 
                ? `${API_URL}/api/categories/${editingCategory._id}`
                : `${API_URL}/api/categories`;
            
            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                await fetchCategories();
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Operation failed');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (categoryId, categoryName) => {
        if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setCategories(categories.filter(c => c._id !== categoryId));
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to delete category');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '' });
                        setShowModal(true);
                    }}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Add Category
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <div key={category._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                category.isActive 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        
                        {category.description && (
                            <p className="text-gray-600 mb-4">{category.description}</p>
                        )}
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleEdit(category)}
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(category._id, category.name)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    placeholder="Enter category name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                    placeholder="Enter description (optional)"
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}