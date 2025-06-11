import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
        { path: '/admin/products', name: 'Products', icon: '🍹' },
        { path: '/admin/categories', name: 'Categories', icon: '📂' },
        { path: '/admin/orders', name: 'Orders', icon: '📦' },
        { path: '/admin/users', name: 'Users', icon: '👥' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 bg-black text-white">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                
                <nav className="mt-8">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                                location.pathname === item.path ? 'bg-gray-100 border-r-2 border-black' : ''
                            }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center space-x-4">
                            <Link to="/" className="text-gray-600 hover:text-gray-900">
                                View Site
                            </Link>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">{user?.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}