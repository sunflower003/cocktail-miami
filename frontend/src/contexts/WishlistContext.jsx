import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Load wishlist when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [isAuthenticated, user]);

    const fetchWishlist = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setWishlistItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        if (!isAuthenticated) {
            return { success: false, message: 'Please login to add items to wishlist' };
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setWishlistItems(prev => [...prev, data.data]);
                return { success: true, message: 'Added to wishlist' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return { success: false, message: 'Failed to add to wishlist' };
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!isAuthenticated) return { success: false, message: 'Please login first' };

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));
                return { success: true, message: 'Removed from wishlist' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return { success: false, message: 'Failed to remove from wishlist' };
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.productId._id === productId);
    };

    const clearWishlist = async () => {
        if (!isAuthenticated) return { success: false, message: 'Please login first' };

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/wishlist`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setWishlistItems([]);
                return { success: true, message: 'Wishlist cleared' };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            return { success: false, message: 'Failed to clear wishlist' };
        }
    };

    const wishlistCount = wishlistItems.length;

    const value = {
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        fetchWishlist,
        wishlistCount
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};