import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    User, 
    MapPin, 
    Phone, 
    Mail, 
    Package, 
    CreditCard,
    Calendar,
    Edit,
    Save,
    X
} from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/admin/orders/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setOrder(result.data);
                setEditData({
                    status: result.data.status,
                    isPaid: result.data.isPaid,
                    notes: result.data.notes || ''
                });
                document.title = `Order #${result.data._id.slice(-8)} - Admin Panel`;
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editData)
            });

            const result = await response.json();

            if (result.success) {
                setOrder(result.data);
                setIsEditing(false);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            setError('Failed to update order');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
                    <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 text-left">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order._id.slice(-8)}
                        </h1>
                        <p className="text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Order
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <img
                                        src={item.product?.images?.[0]?.url || '/img/default-product.png'}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            ${item.price.toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Totals */}
                        <div className="mt-6 pt-6 border-t space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>${order.shippingFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                <span>Total:</span>
                                <span>${order.finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Shipping Address
                        </h3>
                        <div className="text-gray-700">
                            <p className="font-medium">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </p>
                            {order.shippingAddress.company && (
                                <p>{order.shippingAddress.company}</p>
                            )}
                            <p>{order.shippingAddress.address}</p>
                            {order.shippingAddress.apartment && (
                                <p>{order.shippingAddress.apartment}</p>
                            )}
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            <div className="mt-2 pt-2 border-t">
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {order.shippingAddress.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Customer
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium text-gray-900">{order.user.name}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {order.user.email}
                                </p>
                                {order.user.phone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {order.user.phone}
                                    </p>
                                )}
                            </div>
                            <div className="pt-3 border-t text-sm text-gray-600">
                                <p>Member since: {new Date(order.user.createdAt).toLocaleDateString()}</p>
                                {order.user.lastLogin && (
                                    <p>Last login: {new Date(order.user.lastLogin).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Status
                        </h3>
                        
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={editData.isPaid}
                                            onChange={(e) => setEditData({...editData, isPaid: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Mark as Paid</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={editData.notes}
                                        onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add notes about this order..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                                
                                <div>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                        order.isPaid 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>

                                {order.notes && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                        <p className="text-sm text-gray-600">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Method:</span>
                                <span className="font-medium">
                                    {order.paymentMethod === 'payos' ? 'Online Payment' : 'Cash on Delivery'}
                                </span>
                            </div>
                            {order.paymentInfo?.payosOrderCode && (
                                <div className="flex justify-between">
                                    <span>Order Code:</span>
                                    <span className="font-medium">{order.paymentInfo.payosOrderCode}</span>
                                </div>
                            )}
                            {order.paidAt && (
                                <div className="flex justify-between">
                                    <span>Paid At:</span>
                                    <span className="font-medium">
                                        {new Date(order.paidAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;