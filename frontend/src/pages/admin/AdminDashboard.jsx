import { useState, useEffect, useCallback } from 'react';
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

    const fetchDashboardData = useCallback(async () => {
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

            // Fetch users count
            const usersResponse = await fetch(`${API_URL}/api/admin/users?limit=1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usersData = await usersResponse.json();

            // Fetch orders count (if available)
            // const ordersResponse = await fetch(`${API_URL}/api/admin/orders?limit=1`, {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            // const ordersData = await ordersResponse.json();

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

            if (usersData.success) {
                setStats(prev => ({ 
                    ...prev, 
                    totalUsers: usersData.total || 0
                }));
            }

            // if (ordersData.success) {
            //     setStats(prev => ({ 
            //         ...prev, 
            //         totalOrders: ordersData.total || 0
            //     }));
            // }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        document.title = 'Dashboard - Admin Panel';
        fetchDashboardData();
    }, [fetchDashboardData]);

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
                {/* Products Card */}
                <Link to="/admin/products" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                        </div>
                    </div>
                </Link>

                {/* Categories Card */}
                <Link to="/admin/categories" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Categories</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
                        </div>
                    </div>
                </Link>

                {/* Users Card */}
                <Link to="/admin/users" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                        </div>
                    </div>
                </Link>

                {/* Orders Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Orders</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                            <p className="text-xs text-gray-400">Coming soon</p>
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
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Product
                        </Link>
                        <Link
                            to="/admin/categories"
                            className="flex items-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Manage Categories
                        </Link>
                        <Link
                            to="/admin/users"
                            className="flex items-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            Manage Users
                        </Link>
                        <Link
                            to="/admin/products"
                            className="flex items-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            View All Products
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
                        <Link 
                            to="/admin/products" 
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentProducts.length > 0 ? (
                            recentProducts.slice(0, 5).map(product => (
                                <Link
                                    key={product._id}
                                    to={`/admin/products/edit/${product._id}`}
                                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-shrink-0 h-10 w-10">
                                        {product.images?.[0] ? (
                                            <img
                                                className="h-10 w-10 rounded-lg object-cover"
                                                src={product.images[0].url}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ${product.price?.toFixed(2)} • Stock: {product.stock}
                                        </p>
                                    </div>
                                    <div className="ml-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p className="text-gray-500 text-sm mt-2">No products yet</p>
                                <Link 
                                    to="/admin/products/create" 
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 inline-block"
                                >
                                    Create your first product
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.totalProducts}</div>
                        <div className="text-sm text-gray-500">Products</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
                        <div className="text-sm text-gray-500">Categories</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
                        <div className="text-sm text-gray-500">Registered Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">{stats.totalOrders}</div>
                        <div className="text-sm text-gray-500">Orders (Soon)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}