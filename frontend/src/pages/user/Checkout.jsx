import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cart, fetchCart } = useCart();
  
  // ✅ STATE CHO SHIPPING CONFIG VỚI DEFAULT VALUES
  const [shippingConfig, setShippingConfig] = useState({
    FREE_SHIPPING_THRESHOLD: 50,
    SHIPPING_FEE: 1,
    TAX_RATE: 0.08
  });

  const [formData, setFormData] = useState({
    email: user?.email || '',
    emailOffers: true,
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    zipCode: '',
    phone: user?.phone || '', // ✅ AUTO-FILL TỪ USER DATA
    country: 'Vietnam',
    paymentMethod: 'payos',
    saveInfo: true,
    textOffers: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // ✅ FETCH SHIPPING CONFIG
  useEffect(() => {
    const fetchShippingConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/shipping-config`);
        const result = await response.json();
        
        if (result.success) {
          setShippingConfig(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch shipping config:', error);
      }
    };

    fetchShippingConfig();
  }, [API_URL]);

  // ✅ UPDATE FORM DATA WHEN USER DATA CHANGES
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || '', // ✅ AUTO-UPDATE PHONE
      }));
    }
  }, [user]);

  // ✅ AUTH CHECK
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    if (!cart.items || cart.items.length === 0) {
      fetchCart();
    }
  }, [isAuthenticated, navigate, cart.items, fetchCart]);

  // Get checkout items
  const checkoutItems = location.state?.items || cart.items || [];
  const isDirectBuy = location.state?.directBuy || false;

  // ✅ CALCULATE TOTALS
  const subtotal = checkoutItems.reduce((total, item) => {
    const product = isDirectBuy ? item.product : item.productId;
    const price = isDirectBuy ? product.price : item.price;
    return total + (price * item.quantity);
  }, 0);

  const totalItems = checkoutItems.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const shippingFee = subtotal >= shippingConfig.FREE_SHIPPING_THRESHOLD ? 0 : shippingConfig.SHIPPING_FEE;
  const tax = Math.round(subtotal * shippingConfig.TAX_RATE * 100) / 100;
  const total = subtotal + shippingFee + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'address', 'city', 'zipCode', 'phone'];
    
    for (const field of required) {
      if (!formData[field].trim()) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    if (checkoutItems.length === 0) {
      setError('No items to checkout');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      
      const orderData = {
        items: isDirectBuy ? checkoutItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })) : undefined,
        useCartItems: !isDirectBuy,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          zipCode: formData.zipCode,
          phone: formData.phone,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        if (formData.paymentMethod === 'payos' && result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          navigate(`/order-success/${result.data.order._id}`);
        }
      } else {
        setError(result.message || 'Failed to create order');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No items to checkout</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart first</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-left">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form sections */}
            <div className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Contact Section */}
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-left">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 text-left">
                    <input
                      type="checkbox"
                      name="emailOffers"
                      checked={formData.emailOffers}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Email me with news and offers</span>
                  </label>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-left">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  Shipping Address
                </h2>
                
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (Optional)</label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* ✅ BỎ STATE DROPDOWN - CHỈ GIỮ CITY VÀ ZIP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g., Hanoi, Ho Chi Minh City"
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="e.g., 100000"
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* ✅ PHONE AUTO-FILLED FROM USER DATA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                      {user?.phone && (
                        <span className="text-xs text-green-600 ml-2"></span>
                      )}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {!user?.phone && (
                      <p className="text-xs text-amber-600 mt-1">
                        💡 Add phone number to your profile to auto-fill this field
                      </p>
                    )}
                  </div>

                  {/* ✅ COUNTRY - FIXED TO VIETNAM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled
                      className="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-left">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">3</span>
                  </div>
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  {/* PayOS Option */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors text-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payos"
                      checked={formData.paymentMethod === 'payos'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Online Payment (PayOS)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay securely with credit card, bank transfer, or e-wallet
                      </p>
                    </div>
                  </label>

                  {/* COD Option */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors text-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay when you receive your order
                      </p>
                    </div>
                  </label>
                  {/* Crypto Option */}
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors text-left">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <i className="ri-btc-fill text-xl text-yellow-600"></i><span className="font-medium">Crypto Payment</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay with Metamask, Binance,...
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:sticky lg:top-8 h-fit text-left">
              <div className="p-6 rounded-lg border bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {checkoutItems.map((item, index) => {
                    const product = isDirectBuy ? item.product : item.productId;
                    const price = isDirectBuy ? product.price : item.price;
                    
                    return (
                      <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                        <div className="relative">
                          <img
                            src={product.images?.[0]?.url || '/img/default-product.png'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">${price.toFixed(2)} each</p>
                        </div>
                        
                        <div className="text-right">
                          <span className="font-medium">${(price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      Subtotal
                      <span className="text-gray-500">
                        · {totalItems} {totalItems === 1 ? 'item' : 'items'}
                      </span>
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipping
                      {shippingConfig && subtotal < shippingConfig.FREE_SHIPPING_THRESHOLD && (
                        <span className="text-amber-600 text-xs">
                          
                        </span>
                      )}
                    </span>
                    <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shippingFee === 0 ? (
                        <span className="flex items-center gap-1">
                          <span>Free</span>
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
                        `$${shippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax ({shippingConfig ? (shippingConfig.TAX_RATE * 100).toFixed(0) : '8'}%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold text-green-800">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading || !shippingConfig}
                  className="w-full bg-black text-white py-4 rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : !shippingConfig ? (
                    'Loading...'
                  ) : (
                    `Pay Now`
                  )}
                </button>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}