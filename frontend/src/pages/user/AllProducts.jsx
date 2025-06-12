import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import WishlistButton from '../../components/WishlistButton';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFilters, setExpandedFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'newest'
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Calculate min and max prices from products
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    document.title = 'All Products - Cocktail Miami';
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange({ min, max });
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
              Our Cocktails
            </h1>
            <p className="text-sm lg:text-lg text-gray-600 leading-relaxed">
              Discover our complete collection of premium cocktails and spirits. 
              From organic spritzes to original batches, find your perfect drink.
            </p>
          </div>
        </div>
        <img src='/img/6.jpg' className='w-full h-full object-cover allproducts-img'/>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-left">
        <div className="text-lg text-gray-500">
          <Link to="/" className="hover:text-green-800 transition-colors">HOME</Link> 
          <span className="mx-2">/</span> 
          <span className="text-gray-900">ALL PRODUCTS</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-green-800 mb-2">
                  Price Range: ${priceRange.min} - ${priceRange.max}
                </label>
                <div className="px-2">
                  {/* Min Range Slider */}
                  <div className="mb-4">
                    <label className="block text-xs text-green-800 mb-1">Min Price</label>
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange.min}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= priceRange.max) {
                          setPriceRange(prev => ({ ...prev, min: value }));
                        }
                      }}
                      className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  
                  {/* Max Range Slider */}
                  <div className="mb-4">
                    <label className="block text-xs text-green-800 mb-1">Max Price</label>
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange.max}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= priceRange.min) {
                          setPriceRange(prev => ({ ...prev, max: value }));
                        }
                      }}
                      className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>

                  {/* Price Display */}
                  <div className="flex justify-between text-sm text-green-800">
                    <span>${minPrice}</span>
                    <span>${maxPrice}</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setPriceRange({ min: minPrice, max: maxPrice });
                  setCurrentPage(1);
                }}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 mt-6 lg:mt-0">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  <span className="font-semibold">{sortedProducts.length}</span> products found
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="text-center py-16">
                <p className="text-red-600 text-lg">{error}</p>
                <button 
                  onClick={fetchProducts}
                  className="mt-4 btn"
                >
                  Retry
                </button>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <Search className="w-16 h-16 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹ Previous
                  </button> 
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-green-100 text-green-800'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 py-2 text-gray-500">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? 'bg-green-100 text-green-800'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component (Grid only)
const ProductCard = ({ product }) => {
  const productIdentifier = product.slug || product._id;
  
  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Buy now:', product.name);
    // Add to cart logic here
  };

  return (
    <div className="group rounded-lg border border-gray-200 overflow-hidden">
      <Link to={`/products/${productIdentifier}`}>
        <div className="aspect-square flex items-center justify-center p-6 relative overflow-hidden hehehe">
          <img
            src={product.images?.[0]?.url || '/img/default-product.png'}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = '/img/default-product.png';
            }}
          />
          {product.isFeatured && (
            <div className="absolute top-4 left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
          {/* Wishlist button in top-right corner */}
          <div className="absolute top-4 right-4 z-10">
            <WishlistButton 
              productId={product._id}
              size="md"
            />
          </div>
        </div>
      </Link>
      
      <div className="p-3">
        <Link to={`/products/${productIdentifier}`}>
          <h3 className="text-left font-semibold mb-2 line-clamp-2 min-h-[3rem] group-hover:text-green-800 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-medium text-green-800">
            ${product.price}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {product.abv && <span>ABV: {product.abv}%</span>}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-orange-600 font-medium">Low Stock</span>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleBuyNow}
        disabled={product.stock === 0}
        className={`w-full py-3 px-4 font-medium text-sm ${
          product.stock === 0
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800 transition-all duration-300'
        }`}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
      </button>
    </div>
  );
};

export default AllProducts;