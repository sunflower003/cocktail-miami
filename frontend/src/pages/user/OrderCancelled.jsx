import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function OrderCancelled() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Payment Cancelled - Cocktail Miami';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>

          {/* Title and Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
          <p className="text-gray-600 text-lg mb-2">
            Your payment was cancelled and the order was not completed.
          </p>
          <p className="text-gray-500 mb-8">
            No charges have been made to your account.
          </p>

          {/* Order ID if available */}
          {orderId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800 text-sm">
                <strong>Order ID:</strong> {orderId.slice(-8)}
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                This order has been cancelled and will not be processed.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Cart
            </button>
            
            <Link
              to="/products"
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
            
            <Link
              to="/"
              className="w-full text-gray-500 px-6 py-3 rounded-lg font-medium hover:text-gray-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Need help?</p>
            <p className="text-gray-500 text-sm">
              Contact our support team at{' '}
              <a href="mailto:huylee63897@gmail.com" className="text-blue-600 hover:underline">
                huylee63897@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}