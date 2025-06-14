import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function OrderCancelled() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    document.title = 'Payment Cancelled - Cocktail Miami';
    
    // ✅ Fetch order details để hiển thị thông tin
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setOrder(result.data);
        
        // ✅ TỰ ĐỘNG CANCEL ORDER NẾU ĐANG Ở STATUS PENDING
        if (result.data.status === 'pending' && result.data.paymentMethod === 'payos' && !result.data.isPaid) {
          await cancelOrder(result.data._id);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ THÊM FUNCTION ĐỂ CANCEL ORDER
  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // Cập nhật order state với status mới
        setOrder(prev => ({
          ...prev,
          status: 'cancelled'
        }));
        console.log('✅ Order cancelled successfully');
      } else {
        console.error('❌ Failed to cancel order:', result.message);
      }
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

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

          {/* Order Info if available */}
          {order && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="text-left">
                <p className="text-red-800 text-sm font-medium mb-2">
                  <strong>Order Details:</strong>
                </p>
                <p className="text-red-700 text-sm">
                  <strong>Order ID:</strong> #{order._id.slice(-8)}
                </p>
                <p className="text-red-700 text-sm">
                  <strong>Amount:</strong> ${order.finalTotal.toFixed(2)}
                </p>
                <p className="text-red-700 text-sm">
                  <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
                <p className="text-red-600 text-sm mt-2">
                  This order has been cancelled and will not be processed.
                </p>
              </div>
            </div>
          )}

          {/* Order ID if no order details */}
          {orderId && !order && (
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