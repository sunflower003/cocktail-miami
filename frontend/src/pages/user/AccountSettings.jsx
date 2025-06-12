import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

export default function AccountSettings() {
  const [tab, setTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form data states
  const [generalData, setGeneralData] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { user, updateProfile } = useAuth();

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 
                 (import.meta.env.PROD 
                     ? 'https://cocktail-miami-api.onrender.com'
                     : 'http://localhost:5000');

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    return dayjs().diff(dayjs(dateOfBirth), 'year');
  };

  useEffect(() => {
    document.title = 'Account Settings - Cocktail Miami';
    
    // Load user data when component mounts
    if (user) {
      setGeneralData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth).format('YYYY-MM-DD') : ''
      });
    }
  }, [user]);

  const handleGeneralChange = (e) => {
    setGeneralData({
      ...generalData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(generalData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Update user context
        if (updateProfile) {
          updateProfile(data.data.user);
        }
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.massage || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setError(error.massage || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left">Account Settings</h1>
              <p className="text-gray-600 text-left">Manage your account information and preferences</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  Email {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 border-r lg:border-gray-200">
            <div className="bg-white rounded-lg shadow-sm  p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setTab('general')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    tab === 'general'
                      ? 'bg-black text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>General</span>
                  </div>
                </button>
                <button
                  onClick={() => setTab('password')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    tab === 'password'
                      ? 'bg-black text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Password</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Alert Messages */}
              {error && (
                <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <div className="flex items-center text-left">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-left">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  <div className="flex items-center text-left">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-left">{success}</span>
                  </div>
                </div>
              )}

              {/* General Tab */}
              {tab === 'general' && (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0 text-left">General Information</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={generalData.name}
                          onChange={handleGeneralChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:bg-gray-50 disabled:text-gray-500 text-left"
                        />
                      </div>

                      {/* Email (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Email Address</label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-left"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={generalData.phone}
                          onChange={handleGeneralChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:bg-gray-50 disabled:text-gray-500 text-left"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Gender</label>
                        <select
                          name="gender"
                          value={generalData.gender}
                          onChange={handleGeneralChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:bg-gray-50 disabled:text-gray-500 text-left"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={generalData.dateOfBirth}
                          onChange={handleGeneralChange}
                          disabled={!isEditing}
                          max={dayjs().subtract(18, 'year').format('YYYY-MM-DD')}
                          min={dayjs().subtract(100, 'year').format('YYYY-MM-DD')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:bg-gray-50 disabled:text-gray-500 text-left"
                        />
                      </div>

                      {/* Age (Display only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Age</label>
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-left">
                          {generalData.dateOfBirth ? `${calculateAge(generalData.dateOfBirth)} years old` : 'Select date of birth'}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Address</label>
                      <textarea
                        name="address"
                        value={generalData.address}
                        onChange={handleGeneralChange}
                        disabled={!isEditing}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:bg-gray-50 disabled:text-gray-500 text-left"
                        placeholder="Enter your full address"
                      />
                    </div>

                    {/* Account Info */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Member Since</label>
                          <p className="text-gray-900 text-left">{dayjs(user.createdAt).format('MMMM DD, YYYY')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Last Login</label>
                          <p className="text-gray-900 text-left">
                            {user.lastLogin ? dayjs(user.lastLogin).format('MMMM DD, YYYY [at] HH:mm') : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Chỉ hiển thị khi đang edit */}
                    {isEditing && (
                      <div className="border-t pt-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setError('');
                              setSuccess('');
                              // Reset form data về giá trị ban đầu
                              if (user) {
                                setGeneralData({
                                  name: user.name || '',
                                  phone: user.phone || '',
                                  address: user.address || '',
                                  gender: user.gender || '',
                                  dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth).format('YYYY-MM-DD') : ''
                                });
                              }
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </div>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {tab === 'password' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 text-left">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Current Password</label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-left"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-left"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors text-left"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>

                  {/* Password Requirements */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 text-left">Password Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 text-left">
                      <li>• At least 6 characters long</li>
                      <li>• Mix of letters and numbers recommended</li>
                      <li>• Avoid using personal information</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}