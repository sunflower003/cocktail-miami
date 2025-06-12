import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout, isAuthenticated, loading } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setShowUserMenu(false);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleAuthAction = () => {
        if (isAuthenticated) {
            handleLogout();
        } else {
            navigate('/login');
        }
        closeMenu();
    };

    // Helper function to get user display name
    const getUserDisplayName = () => {
        if (!user) return '';
        return user.name ? user.name.split(' ')[0] : user.email.split('@')[0];
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user) return '';
        if (user.name) {
            const names = user.name.split(' ');
            return names.length > 1 
                ? `${names[0][0]}${names[1][0]}`.toUpperCase()
                : names[0][0].toUpperCase();
        }
        return user.email[0].toUpperCase();
    };

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    return (
        <>
            <header className="header-div flex justify-between items-center w-full py-16 px-32">
                {/* Left Navigation Links */}
                <div className='header-links flex items-center justify-center gap-20'>
                    <Link to="/products" className="link text-blackCus font-medium hover:text-gray-600 transition">
                        Our Cocktails
                    </Link>
                    <Link to="/" className="link text-blackCus font-medium hover:text-gray-600 transition">
                        Drink Clean
                    </Link>
                    <Link to="/" className="link text-blackCus font-medium hover:text-gray-600 transition">
                        Our Story
                    </Link>
                </div>

                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <img src='/logo.png' alt="Cocktail Miami Logo" className='header-logo h-12 hover:opacity-80 transition' />
                </Link>

                {/* Right Navigation Links */}
                <div className='header-links flex items-center justify-center gap-20'>
                    <Link to="/" className="link text-blackCus font-medium hover:text-gray-600 transition">
                        Tasting Room
                    </Link>
                    
                    {/* CART LINK VỚI COUNTER - SỬA LẠI */}
                    <Link to="/cart" className="link text-blackCus font-medium hover:text-gray-600 transition relative">
                        <span className="flex items-center gap-1">
                            Cart
                            {/* CART COUNTER BADGE - SỬA POSITION */}
                            {cartCount > 0 && (
                                <span className="bg-green-100 text-green-800 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1 ml-1" style={{ fontSize: '10px', lineHeight: '1' }}>
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </span>
                    </Link>
                    
                    {/* Authentication Section */}
                    {loading ? (
                        <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
                    ) : isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={toggleUserMenu}
                                className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-sm font-bold text-white">
                                        {getUserInitials()}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {getUserDisplayName()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {user?.role || 'Member'}
                                    </span>
                                </div>
                                <svg 
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {/* Enhanced User Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-76 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {/* User Info Header */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-md">
                                                <span className="text-white font-bold">
                                                    {getUserInitials()}
                                                </span>
                                            </div>
                                            <div className='text-left'> 
                                                <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
                                                <p className="text-sm text-gray-600">{user?.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                                        {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                    {isAdmin && (
                                                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        {/* Admin Panel - Only show for admin users */}
                                        {isAdmin && (
                                            <>
                                                <Link 
                                                    to="/admin/dashboard" 
                                                    className="flex items-center gap-3 px-6 py-3 text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <span className="font-medium">Admin Panel</span>
                                                </Link>
                                                <div className="border-t border-gray-200 my-2"></div>
                                            </>
                                        )}

                                        <Link 
                                            to="/orders" 
                                            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <span className="font-medium">My Orders</span>
                                        </Link>

                                        
                                        

                                        <Link 
                                            to="/wishlist" 
                                            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span className="font-medium">Wishlist</span>
                                        </Link>

                                        <Link 
                                            to="/account-settings" 
                                            className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-medium">Settings</span>
                                        </Link>

                                        <div className="border-t border-gray-200 my-2"></div>

                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-6 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="font-medium">Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link 
                            to="/login" 
                            className="btn"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle - Giữ nguyên logic CSS cũ */}
                <i className="ri-menu-3-line hidden" onClick={toggleMenu}></i>

                {/* Mobile Menu - Sử dụng logic CSS cũ với active state */}
                <aside className={`menu-header absolute top-0 right-0 h-screen bg-white shadow-lg hidden ${isMenuOpen ? 'active' : ''}`}>
                    <i className="ri-close-line absolute top-0 right-0 p-4" onClick={closeMenu}></i>
                    <div className='flex flex-col text-left p-4 gap-6 mt-16'>
                        <Link to="/products" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Our Cocktails
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Drink Clean
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Our Story
                        </Link>
                        <Link to="/" className="link-resp text-blackCus font-medium" onClick={closeMenu}>
                            Tasting Room
                        </Link>
                       
                        
                        {/* Mobile Auth Section - Enhanced */}
                        {loading ? (
                            <div className="link-resp text-blackCus font-medium">Loading...</div>
                        ) : isAuthenticated ? (
                            <div className="border-t pt-4 mt-4">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white font-bold">
                                            {getUserInitials()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-blackCus">
                                            {getUserDisplayName()}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {user?.email}
                                        </div>
                                        {isAdmin && (
                                            <div className="text-xs text-blue-600 font-medium">
                                                Admin
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Admin Panel for Mobile */}
                                {isAdmin && (
                                    <Link 
                                        to="/admin/dashboard" 
                                        className="link-resp text-blue-600 font-medium block py-2 border-b border-gray-200 mb-2"
                                        onClick={closeMenu}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <Link to="/cart" className="link-cart text-blackCus font-medium hover:text-gray-600 transition relative" onClick={closeMenu}>
                                    <span className="flex items-center gap-1">
                                        Cart
                                        {/* CART COUNTER BADGE - SỬA POSITION */}
                                        {cartCount > 0 && (
                                            <span className="bg-green-100 text-green-800 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1 ml-1" style={{ fontSize: '10px', lineHeight: '1' }}>
                                                {cartCount > 99 ? '99+' : cartCount}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                                <Link 
                                    to="/orders" 
                                    className="link-resp text-blackCus font-medium block py-2"
                                    onClick={closeMenu}
                                >
                                    Orders
                                </Link>
                                <Link 
                                    to="/account-settings" 
                                    className="link-resp text-blackCus font-medium block py-2"
                                    onClick={closeMenu}
                                >
                                    Settings
                                </Link>
                                <button 
                                    onClick={handleAuthAction}
                                    className="link-resp text-red-600 font-medium text-left w-full py-2 mt-2"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link 
                                to="/login" 
                                className="link-resp text-blackCus font-medium"
                                onClick={closeMenu}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </aside>
            </header>
        </>
    );
}

export default Header;