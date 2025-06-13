import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import WishlistButton from './WishlistButton';
import Toast from './Toast';

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const productIdentifier = product.slug || product._id;
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [addingToCart, setAddingToCart] = useState(false);
    
    // Toast notification state
    const [toast, setToast] = useState({
        show: false,
        type: '',
        message: ''
    });

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
    
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if user is logged in
        if (!user) {
            navigate('/login', { state: { from: `/products/${productIdentifier}` } });
            return;
        }

        // Check if product is in stock
        if (product.stock === 0) {
            showToast('error', 'Product is out of stock');
            return;
        }

        try {
            setAddingToCart(true);
            
            const result = await addToCart(product._id, 1);
            
            if (result.success) {
                showToast('success', `${product.name} added to cart successfully!`);
                console.log(`Added ${product.name} to cart successfully`);
            } else {
                showToast('error', `Failed to add ${product.name} to cart: ${result.message}`);
                console.error('Failed to add to cart:', result.message);
            }
        } catch (error) {
            showToast('error', `Error adding ${product.name} to cart`);
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    };
    
    if (viewMode === 'list') {
        return (
            <>
                {/* Toast Notification */}
                <Toast 
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={hideToast}
                />
                
                <Link 
                    to={`/products/${productIdentifier}`}
                    className="block rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 h-48 sm:h-auto flex items-center justify-center p-4 relative">
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
                            {/* Wishlist button for list view */}
                            <div className="absolute top-2 right-2">
                                <WishlistButton 
                                    productId={product._id} 
                                    size="sm"
                                />
                            </div>
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between text-left">
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                                        {product.name}
                                    </h3>
                                    <span className="text-2xl font-bold text-green-800 ml-4">
                                        ${product.price}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {product.subDescription || product.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                                        {product.category?.name || 'Uncategorized'}
                                    </span>
                                    {product.abv && (
                                        <span>ABV: {product.abv}%</span>
                                    )}
                                    {product.country && (
                                        <span>{product.country}</span>
                                    )}
                                </div>
                                
                                {/* Add to Cart Button for List View */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0 || addingToCart}
                                    className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                                        product.stock === 0
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : addingToCart
                                            ? 'bg-gray-600 text-white cursor-not-allowed'
                                            : 'bg-black text-white hover:bg-gray-800 hover:scale-105'
                                    }`}
                                >
                                    {product.stock === 0 
                                        ? 'Out of Stock' 
                                        : addingToCart 
                                        ? 'Adding...' 
                                        : 'Add to Cart'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </Link>
            </>
        );
    }

    return (
        <>
            {/* Toast Notification */}
            <Toast 
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={hideToast}
            />
            
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
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className={`w-full py-3 px-4 font-medium text-sm transition-all duration-200 ${
                        product.stock === 0
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : addingToCart
                            ? 'bg-gray-600 text-white cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800 hover:scale-105'
                    }`}
                >
                    {product.stock === 0 
                        ? 'Out of Stock' 
                        : addingToCart 
                        ? 'Adding...' 
                        : 'Add to Cart'
                    }
                </button>
            </div>
        </>
    );
};

export default ProductCard;