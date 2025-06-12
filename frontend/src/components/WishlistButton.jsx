import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const WishlistButton = ({ 
    productId, 
    className = '',
    size = 'md'
}) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const inWishlist = isInWishlist(productId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }

        setIsLoading(true);

        try {
            if (inWishlist) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(productId);
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'w-8 h-8 p-1.5',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-2.5'
    };

    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-7 h-7'
    };

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={isLoading}
                className={`
                    ${sizeClasses[size]}
                    relative rounded-full border-2 transition-all duration-200 flex items-center justify-center
                    ${inWishlist 
                        ? 'bg-red-500 border-red-500 text-white shadow-lg' 
                        : 'bg-white border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
                    ${className}
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                `}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart 
                    className={`
                        ${iconSizes[size]} 
                        transition-all duration-200
                        ${inWishlist ? 'fill-current' : ''}
                        ${isLoading ? 'animate-pulse' : ''}
                    `}
                />
                
                {/* Loading spinner overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`
                            border-2 border-current border-t-transparent rounded-full animate-spin
                            ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
                        `}></div>
                    </div>
                )}
            </button>

            {/* Login prompt tooltip */}
            {showLoginPrompt && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                    Please login to add to wishlist
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
            )}

            {/* Success animation */}
            {inWishlist && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                </div>
            )}
        </div>
    );
};

export default WishlistButton;