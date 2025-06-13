import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/ProductCard'; // ✅ THÊM IMPORT NÀY

const Wishlist = () => {
    const { wishlistItems, loading, clearWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFilters, setExpandedFilters] = useState({});

    useEffect(() => {
        document.title = 'My Wishlist - Cocktail Miami';
    }, []);

    const handleClearWishlist = async () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            await clearWishlist();
        }
    };

    const toggleFilter = (filterName) => {
        setExpandedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    // Filter wishlist items based on search
    const filteredWishlistItems = wishlistItems.filter(item => {
        const product = item.productId;
        if (!product) return false;
        return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Please Login</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist</p>
                    <Link
                        to="/login"
                        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative flex items-center justify-center lg:h-[400px] h-[200px]">
                <div className="relative allproducts-hero w-1/2 h-full flex items-center justify-center lg:px-16 px-6">
                    <div className="text-left">
                        <h1 className="text-2xl lg:text-4xl font-bold mb-6">
                            My Wishlist
                        </h1>
                        <p className="text-sm lg:text-lg text-gray-600 leading-relaxed">
                            Your saved cocktails and spirits collection.
                            {wishlistItems.length > 0 && ` ${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} waiting for you.`}
                        </p>
                    </div>
                </div>
                <img src='/img/wishlist.jpg' className='w-full h-full object-cover allproducts-img'/>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-left">
                <div className="text-lg text-gray-500">
                    <Link to="/" className="hover:text-green-800 transition-colors">HOME</Link> 
                    <span className="mx-2">/</span> 
                    <span className="text-gray-900">WISHLIST</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {wishlistItems.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-600 mb-6">Start adding products you love to save them for later</p>
                        <Link
                            to="/products"
                            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="lg:flex lg:gap-8">
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => toggleFilter('mobile-filters')}
                                className="flex items-center gap-2 w-full justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-5 h-5" />
                                <span>Filters</span>
                                {expandedFilters['mobile-filters'] ? 
                                    <ChevronUp className="w-4 h-4" /> : 
                                    <ChevronDown className="w-4 h-4" />
                                }
                            </button>
                        </div>

                        {/* Sidebar Filters */}
                        <div className={`w-full lg:w-80 flex-shrink-0 ${expandedFilters['mobile-filters'] ? 'block' : 'hidden lg:block'}`}>
                            <div className="rounded-2xl p-6 sticky top-4 text-left">
                                <h3 className="font-semibold text-xl text-gray-900 mb-6">Filters</h3>
                                
                                {/* Search */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search wishlist items..."
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                    }}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium mb-4"
                                >
                                    Clear All Filters
                                </button>

                                {/* Clear All */}
                                <button
                                    onClick={handleClearWishlist}
                                    className="w-full py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear All Wishlist
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 mt-6 lg:mt-0">
                            {/* Controls Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                                <div className="flex items-center gap-4">
                                    <p className="text-gray-600">
                                        <span className="font-semibold">{filteredWishlistItems.length}</span> products found
                                    </p>
                                </div>
                            </div>

                            {/* Products Grid */}
                            {filteredWishlistItems.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="mb-4">
                                        <Search className="w-16 h-16 text-gray-300 mx-auto" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                                    <p className="text-gray-500">Try adjusting your filters or search terms</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                    {filteredWishlistItems.map((item) => (
                                        <ProductCard 
                                            key={item._id} 
                                            product={item.productId}
                                            viewMode="grid" // ✅ SỬ DỤNG COMPONENT GIỐNG ALLPRODUCTS
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;