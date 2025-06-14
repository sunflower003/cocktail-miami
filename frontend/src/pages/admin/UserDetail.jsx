import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function UserDetail() {
    const { id } = useParams();
  
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        isBlocked: false,
        isEmailVerified: false,
        address: '' // Changed to simple string
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        document.title = 'User Details - Admin Panel';
        fetchUser();
    }, [id]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'user',
                isBlocked: user.isBlocked || false,
                isEmailVerified: user.isEmailVerified || false,
                address: user.address || '' // Simple string assignment
            });
        }
    }, [user]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setUser(data.data);
            } else {
                setError(data.message || 'User not found');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setError('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setUser(data.data);
                setSuccess('User updated successfully');
                setIsEditing(false);
            } else {
                setError(data.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            setError('Failed to update user');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-4">{error}</div>
                <Link
                    to="/admin/users"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 text-left">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        to="/admin/users"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                        <p className="text-gray-600">Manage user information and permissions</p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Edit User
                    </button>
                )}
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                    </div>
                </div>
            )}

            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* User Avatar & Basic Info */}
                        <div className="lg:col-span-1">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white font-bold text-4xl">
                                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                        user.role === 'admin' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role?.toUpperCase()}
                                    </div>
                                    <div className={`block px-3 py-1 text-sm font-semibold rounded-full ${
                                        user.isBlocked
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                    </div>
                                    <div className={`block px-3 py-1 text-sm font-semibold rounded-full ${
                                        user.isEmailVerified
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {user.isEmailVerified ? 'EMAIL VERIFIED' : 'EMAIL UNVERIFIED'}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Address Display */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Address
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {user.address || 'No address provided'}
                                </p>
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information - Single Field */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Address Information
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Complete Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows="4"
                                        maxLength="500"
                                        placeholder="Ha Noi, Viet Nam"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formData.address.length}/500 characters
                                    </p>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A7.963 7.963 0 0012 2C6.477 2 2 6.477 2 12s4.477 10 10 10c1.38 0 2.694-.28 3.892-.784M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Account Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isBlocked"
                                            id="isBlocked"
                                            checked={formData.isBlocked}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded disabled:opacity-50"
                                        />
                                        <label htmlFor="isBlocked" className="ml-2 block text-sm text-gray-900">
                                            Block this user (prevents login and access)
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isEmailVerified"
                                            id="isEmailVerified"
                                            checked={formData.isEmailVerified}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded disabled:opacity-50"
                                        />
                                        <label htmlFor="isEmailVerified" className="ml-2 block text-sm text-gray-900">
                                            Email verified
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Account Timestamps */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Account History
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Member Since
                                        </label>
                                        <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Login
                                        </label>
                                        <p className="text-gray-900">
                                            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Updated
                                        </label>
                                        <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            User ID
                                        </label>
                                        <p className="text-gray-900 font-mono text-sm break-all">{user._id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="border-t pt-6">
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError('');
                                                setSuccess('');
                                                // Reset form
                                                setFormData({
                                                    name: user.name || '',
                                                    email: user.email || '',
                                                    phone: user.phone || '',
                                                    role: user.role || 'user',
                                                    isBlocked: user.isBlocked || false,
                                                    isEmailVerified: user.isEmailVerified || false,
                                                    address: user.address || ''
                                                });
                                            }}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}