import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Cart() {
    const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Shopping Cart - Cocktail Miami';
    }, []);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        
        setUpdatingItems(prev => new Set(prev).add(productId));
        await updateCartItem(productId, newQuantity);
        setUpdatingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
    };

    const handleRemoveItem = async (productId) => {
        setUpdatingItems(prev => new Set(prev).add(productId));
        await removeFromCart(productId);
        setUpdatingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your entire cart?')) {
            await clearCart();
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Please Login</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-left">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0 text-left">
                            
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                                <p className="text-gray-600">
                                    {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
                                </p>
                            </div>
                        </div>
                        {cart.items?.length > 0 && (
                            <button
                                onClick={handleClearCart}
                                className="text-red-600 hover:text-red-800 transition-colors text-sm flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {cart.items?.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                        <p className="text-gray-600 mb-6">Start adding some great cocktails to your cart</p>
                        <Link
                            to="/products"
                            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items Section */}
                        <div className="lg:col-span-2">
                            {/* Desktop Table Header */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 mb-6 text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-3">Quantity</div>
                                <div className="col-span-3 text-right">Total</div>
                            </div>

                            {/* Cart Items */}
                            <div className="space-y-4 md:space-y-6">
                                {cart.items.map((item) => {
                                    const product = item.productId;
                                    const productIdentifier = product.slug || product._id;
                                    const isUpdating = updatingItems.has(product._id);
                                    
                                    return (
                                        <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-0 md:border-0 md:rounded-none md:grid md:grid-cols-12 md:gap-4 md:py-6 md:border-b">
                                            {/* Mobile Layout */}
                                            <div className="md:hidden">
                                                <div className="flex gap-4 mb-4">
                                                    <div className="w-20 h-20 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.images?.[0]?.url || '/img/default-product.png'}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                e.target.src = '/img/default-product.png';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <Link 
                                                            to={`/products/${productIdentifier}`}
                                                            className="font-semibold text-gray-900 hover:text-green-800 transition-colors"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <p className="text-lg font-medium text-green-800 mt-1">
                                                            ${item.price.toFixed(2)}
                                                        </p>
                                                        {product.stock <= 5 && (
                                                            <p className="text-orange-600 text-sm mt-1">
                                                                Only {product.stock} left in stock
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center border border-gray-300 rounded-md">
                                                            <button
                                                                onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                                                                disabled={isUpdating || item.quantity <= 1}
                                                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                            >
                                                                <Minus className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                            <span className="px-3 py-2 min-w-[50px] text-center">
                                                                {isUpdating ? '...' : item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                                                                disabled={isUpdating || item.quantity >= product.stock}
                                                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                            >
                                                                <Plus className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveItem(product._id)}
                                                            disabled={isUpdating}
                                                            className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop Layout */}
                                            <div className="hidden md:contents">
                                                {/* Product Info */}
                                                <div className="col-span-6 flex gap-4 items-center">
                                                    <div className="h-24 w-24 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.images?.[0]?.url || '/img/default-product.png'}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                e.target.src = '/img/default-product.png';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <Link 
                                                            to={`/products/${productIdentifier}`}
                                                            className="font-semibold text-lg text-gray-900 hover:text-green-800 transition-colors"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <p className="text-lg font-medium text-green-800 mt-1">
                                                            ${item.price.toFixed(2)}
                                                        </p>
                                                        
                                                        {product.stock <= 5 && (
                                                            <p className="text-orange-600 text-sm mt-1">
                                                                Only {product.stock} left in stock
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="col-span-3 flex items-center justify-center">
                                                    <div className="flex items-center border border-gray-300 rounded-md">
                                                        <button
                                                            onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                                                            disabled={isUpdating || item.quantity <= 1}
                                                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                        >
                                                            <Minus className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                        <span className="px-4 py-2 min-w-[60px] text-center">
                                                            {isUpdating ? '...' : item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                                                            disabled={isUpdating || item.quantity >= product.stock}
                                                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                        >
                                                            <Plus className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(product._id)}
                                                        disabled={isUpdating}
                                                        className="ml-4 p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Total */}
                                                <div className="col-span-3 flex items-center">
                                                    <span className="text-lg font-semibold text-gray-900 text-right w-full">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Checkout Section */}
                        <div className="lg:col-span-1">
                            <div className="rounded-lg p-6 sticky top-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                
                                {/* Order Details */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                                        <span className="font-medium">${cart.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">Free</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">Calculated at checkout</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">Total</span>
                                            <span className="text-lg font-semibold text-green-800">
                                                ${cart.totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button 
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-4"
                                >
                                    Proceed to Checkout
                                </button>

                                {/* Continue Shopping */}
                                <Link
                                    to="/products"
                                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center block"
                                >
                                    Continue Shopping
                                </Link>

                                {/* Security Notice */}
                                <div className="mt-6 text-base text-gray-500 text-center">
                                    <p><i className="ri-shield-keyhole-line"></i> Secure checkout with SSL encryption</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}