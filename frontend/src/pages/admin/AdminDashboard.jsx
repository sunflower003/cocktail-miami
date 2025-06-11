import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalUsers: 0,
        totalOrders: 0
    });
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        document.title = 'Dashboard - Admin Panel';
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch products
            const productsResponse = await fetch(`${API_URL}/api/products?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const productsData = await productsResponse.json();

            // Fetch categories
            const categoriesResponse = await fetch(`${API_URL}/api/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const categoriesData = await categoriesResponse.json();

            if (productsData.success) {
                setRecentProducts(productsData.data);
                setStats(prev => ({ 
                    ...prev, 
                    totalProducts: productsData.total || productsData.data.length 
                }));
            }

            if (categoriesData.success) {
                setStats(prev => ({ 
                    ...prev, 
                    totalCategories: categoriesData.count || categoriesData.data.length 
                }));
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
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
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to the admin panel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-lg">🍹</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 text-lg">📂</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Categories</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600 text-lg">👥</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 text-lg">📦</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Orders</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link
                            to="/admin/products/create"
                            className="flex items-center p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <span className="mr-3">➕</span>
                            Add New Product
                        </Link>
                        <Link
                            to="/admin/categories"
                            className="flex items-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <span className="mr-3">📂</span>
                            Manage Categories
                        </Link>
                        <Link
                            to="/admin/products"
                            className="flex items-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <span className="mr-3">🍹</span>
                            View All Products
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h3>
                    <div className="space-y-3">
                        {recentProducts.length > 0 ? (
                            recentProducts.slice(0, 5).map(product => (
                                <div key={product._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        {product.images?.[0] ? (
                                            <img
                                                className="h-10 w-10 rounded-lg object-cover"
                                                src={product.images[0].url}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Img</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ${product.price.toFixed(2)} • Stock: {product.stock}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No products yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}