import React, { useState } from 'react';
import { Search, Info, Smartphone, Lock, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const [email, setEmail] = useState('');
  const [emailOffers, setEmailOffers] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Alabama');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [textOffers, setTextOffers] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [useBillingAddress, setUseBillingAddress] = useState(true);
  const [saveInfo, setSaveInfo] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('');
  const [discountCode, setDiscountCode] = useState('');

  const orderItems = [
    {
      id: 1,
      name: 'Pinot Gris',
      description: 'Box of 12 bottles',
      price: 149.00,
      quantity: 1
    },
    {
      id: 2,
      name: 'Pinot Noir 2023',
      description: 'Box of 12 bottles',
      details: 'Every 1 month\nDiscount: 20%',
      price: 119.00,
      quantity: 1
    }
  ];

  const subtotal = 268.00;
  
  const total = 268.00;
  const recurringSubtotal = 119.00;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="space-y-8">
            {/* Express Checkout */}
            <div>
              <h2 className="text-lg font-medium mb-4">Express checkout</h2>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 text-white py-4 rounded-md font-medium hover:bg-purple-700 transition-colors">
                  ShopPay
                </button>
                <button className="w-full bg-gray-900 text-white py-4 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <span className="text-white font-bold">G</span>
                  <span>Pay</span>
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                By continuing with your payment, you agree to the future charges listed on this page and the{' '}
                <button className="underline">cancellation policy</button>.
              </p>
            </div>

            <div className="text-center text-gray-500">OR</div>

            {/* Contact Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Contact</h2>
                <button className="text-blue-600 hover:underline text-sm">Log in</button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailOffers}
                    onChange={(e) => setEmailOffers(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Email me with news and offers</span>
                </label>
              </div>
            </div>

            {/* Delivery Section */}
            <div>
              <h2 className="text-lg font-medium mb-4">Delivery</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Country/Region</label>
                  <select className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>United States</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Alabama</option>
                    <option>Alaska</option>
                    <option>Arizona</option>
                  </select>
                  <input
                    type="text"
                    placeholder="ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={textOffers}
                    onChange={(e) => setTextOffers(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Text me with news and offers</span>
                </label>
              </div>
            </div>

            {/* Shipping Method */}
            <div>
              <h2 className="text-lg font-medium mb-4">Shipping method</h2>
              <div className="bg-gray-100 p-4 rounded-md text-center text-gray-600">
                Enter your shipping address to view available shipping methods.
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h2 className="text-lg font-medium mb-2">Payment</h2>
              <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>
              
              <div className="space-y-4">
                <div className="border border-gray-300 rounded-md">
                  <div className="bg-blue-50 p-4 border-b border-gray-300 flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                      <span className="font-medium">Credit card</span>
                    </label>
                    <div className="flex gap-2">
                      <img src="/api/placeholder/30/20" alt="Visa" className="w-8 h-5" />
                      <img src="/api/placeholder/30/20" alt="Mastercard" className="w-8 h-5" />
                      <img src="/api/placeholder/30/20" alt="Amex" className="w-8 h-5" />
                      <img src="/api/placeholder/30/20" alt="Discover" className="w-8 h-5" />
                      <span className="text-sm text-gray-500">+4</span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Expiration date (MM / YY)"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Security code"
                          value={securityCode}
                          onChange={(e) => setSecurityCode(e.target.value)}
                          className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Name on card"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useBillingAddress}
                        onChange={(e) => setUseBillingAddress(e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Use shipping address as billing address</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div>
              <h2 className="text-lg font-medium mb-4">Remember me</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Save my information for a faster checkout with a Shop account</span>
                </label>
                
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>+1</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Mobile phone number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure and encrypted</span>
              <ShoppingBag className="w-4 h-4 ml-auto" />
            </div>

            {/* Pay Now Button */}
            <button className="w-full bg-blue-600 text-white py-4 rounded-md font-medium text-lg hover:bg-blue-700 transition-colors">
              Pay now
            </button>

            {/* Terms and Conditions */}
            <div className="text-xs text-gray-600 space-y-2">
              <p>
                Your info will be saved to a Shop account. By continuing, you agree to Shop's{' '}
                <button className="underline">Terms of Service</button> and acknowledge the{' '}
                <button className="underline">Privacy Policy</button>.
              </p>
              
              <p>
                One or more items in your cart is a deferred or recurring purchase. By continuing with your payment, you agree that your payment method will automatically be charged at the price and frequency listed on this page until your order is fulfilled or you cancel. All cancellations are subject to the{' '}
                <button className="underline">cancellation policy</button>.
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-4 text-sm text-blue-600 pt-4 border-t border-gray-200">
              <button className="hover:underline">Refund policy</button>
              <button className="hover:underline">Privacy policy</button>
              <button className="hover:underline">Terms of service</button>
              <button className="hover:underline">Cancellation policy</button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-gray-50 p-6 lg:sticky lg:top-8 h-fit">
            <div className="space-y-6">
              {/* Order Items */}
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-20 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                        <div className={`w-6 h-16 rounded-full opacity-60 ${
                          index === 0 ? 'bg-gradient-to-b from-yellow-300 to-yellow-500' : 'bg-gradient-to-b from-gray-700 to-gray-900'
                        }`}></div>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      {item.details && (
                        <div className="text-sm text-gray-600 mt-1">
                          {item.details.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code or gift card"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  Apply
                </button>
              </div>

              {/* Order Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-300">
                <div className="flex justify-between text-sm">
                  <span>Subtotal • 2 items</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-gray-500">Enter shipping address</span>
                </div>
                
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">USD </span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span>Recurring subtotal</span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <span>${recurringSubtotal.toFixed(2)} every month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}