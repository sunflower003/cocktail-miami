import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Load cart when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchCart();
        } else {
            setCart({ items: [], totalAmount: 0, totalItems: 0 });
        }
    }, [isAuthenticated, user]);

    const fetchCart = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setCart(data.data);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            return { success: false, message: 'Please login to add items to cart' };
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();
            
            if (data.success) {
                setCart(data.data);
                return { success: true, message: 'Added to cart' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, message: 'Failed to add to cart' };
        }
    };

    const updateCartItem = async (productId, quantity) => {
        if (!isAuthenticated) return { success: false, message: 'Please login first' };

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/cart/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();
            
            if (data.success) {
                setCart(data.data);
                return { success: true, message: 'Cart updated' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            return { success: false, message: 'Failed to update cart' };
        }
    };

    const removeFromCart = async (productId) => {
        if (!isAuthenticated) return { success: false, message: 'Please login first' };

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setCart(data.data);
                return { success: true, message: 'Removed from cart' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, message: 'Failed to remove from cart' };
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) return { success: false, message: 'Please login first' };

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/cart/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setCart(data.data);
                return { success: true, message: 'Cart cleared' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, message: 'Failed to clear cart' };
        }
    };

    const getItemQuantity = (productId) => {
        const item = cart.items?.find(item => item.productId._id === productId);
        return item ? item.quantity : 0;
    };

    const isInCart = (productId) => {
        return cart.items?.some(item => item.productId._id === productId) || false;
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        getItemQuantity,
        isInCart,
        cartCount: cart.totalItems || 0,
        cartTotal: cart.totalAmount || 0
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};