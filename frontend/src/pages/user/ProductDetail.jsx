import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import ProductReviews from '../../components/ProductReview.jsx';
import Toast from '../../components/Toast.jsx';
import WishlistButton from '../../components/WishlistButton.jsx'; // ✅ THÊM IMPORT

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({
    show: false,
    type: '',
    message: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Toast functions
  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message
    });
  };

  const hideToast = () => {
    setToast({
      show: false,
      type: '',
      message: ''
    });
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products/${id}`);
        const result = await response.json();
        
        if (result.success) {
          setProduct(result.data);
          document.title = `${result.data.name} - Cocktail Miami`;
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, API_URL]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (product.stock === 0) {
      showToast('error', 'Product is out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      
      const result = await addToCart(product._id, quantity);
      
      if (result.success) {
        showToast('success', `Added ${quantity} ${product.name} to cart successfully!`);
        console.log(`Added ${quantity} ${product.name} to cart successfully`);
      } else {
        showToast('error', `❌ Failed to add to cart: ${result.message}`);
        console.error('Failed to add to cart:', result.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('error', `❌ Error adding ${product.name} to cart`);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        items: [{ product, quantity }],
        directBuy: true 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/products')}
          className="btn bg-black text-white"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const productImages = product.images?.length > 0 ? product.images : [{ url: '/img/default-product.png', alt: product.name }];
  const currentImage = productImages[selectedImageIndex];
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />

      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              Home
            </button>
            <span className="text-gray-400">/</span>
            <button 
              onClick={() => navigate('/products')}
              className="text-gray-500 hover:text-gray-700"
            >
              Products
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden relative">
              <img
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                className="w-full h-full object-contain p-8"
                onError={(e) => {
                  e.target.src = '/img/default-product.png';
                }}
              />
              
              {/* ✅ THÊM NÚT TIM VÀO GÓC PHẢI TRÊN HÌNH ẢNH */}
              <div className="absolute top-4 right-4 z-10">
                <WishlistButton 
                  productId={product._id}
                  size="lg"
                  className="shadow-lg backdrop-blur-sm"
                />
              </div>
              
              {product.isFeatured && (
                <div className="absolute top-4 left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-black shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src = '/img/default-product.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8 text-left">
            {/* Header */}
            <div className="space-y-4">
              {product.company && (
                <p className="text-sm uppercase tracking-wide font-medium">
                  {product.company} Company
                </p>
              )}
              
              {/* ✅ THÊM NÚT TIM VÀO HEADER CHO MOBILE/TABLET */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 leading-tight flex-1">
                  {product.name}
                </h1>
                
              </div>
              
              {product.category && (
                <div className="flex space-x-2 text-left">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {product.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.stock > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    {product.stock} in stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              {product.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">About</h3>
                  <p className={`text-gray-600 leading-relaxed ${
                    showFullDescription ? '' : 'line-clamp-3'
                  }`}>
                    {product.description}
                  </p>
                  {product.description.length > 150 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-black font-medium text-sm hover:underline"
                    >
                      {showFullDescription ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <div className="text-sm grid grid-cols-1 gap-4">
                {product.abv && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">ABV:</span>
                    <span className="text-black">{product.abv}%</span>
                  </div>
                )}
                {product.country && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Country:</span>
                    <span className="text-gray-900">{product.country}</span>
                  </div>
                )}
                {product.region && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Region:</span>
                    <span className="text-gray-900">{product.region}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      <i className="ri-leaf-line"></i> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-6 pt-6 border-t">
              {!isOutOfStock && (
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {isOutOfStock ? (
                  <button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-semibold text-lg cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-colors"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="w-full border-2 border-black text-black py-4 rounded-xl font-medium text-lg hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                    >
                      {addingToCart ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                          <span>Adding to Cart...</span>
                        </div>
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                    
                   
                  </>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure payment & fast delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Reviews Section - Full width */}
        <div className="mt-12">
          <ProductReviews productId={product._id} />
        </div>

        {/* Related Products Section */}
        <div className="mt-16 pt-16 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
          <div className="text-center text-gray-500 py-8">
            Related products coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
