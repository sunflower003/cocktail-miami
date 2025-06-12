import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        status: '',
        verified: '',
        page: 1,
        limit: 10
    });
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const response = await fetch(`${API_URL}/api/admin/users?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setUsers(data.data.users);
                setTotalUsers(data.data.total);
                setTotalPages(data.data.totalPages);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [API_URL, filters]);

    useEffect(() => {
        document.title = 'User Management - Admin Panel';
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({
            ...prev,
            page
        }));
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            setError('');
            setSuccess('');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setSuccess(`User ${currentStatus === 'active' ? 'blocked' : 'activated'} successfully`);
                fetchUsers(); // Refresh the list
            } else {
                setError(data.message || 'Failed to update user status');
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            setError('Failed to update user status');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setError('');
            setSuccess('');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('User role updated successfully');
                fetchUsers(); // Refresh the list
            } else {
                setError(data.message || 'Failed to update user role');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            setError('Failed to update user role');
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setError('');
            setSuccess('');
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('User deleted successfully');
                fetchUsers(); // Refresh the list
                setShowDeleteModal(false);
                setUserToDelete(null);
            } else {
                setError(data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user');
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete({ id: user._id, name: user.name, email: user.email });
        setShowDeleteModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Manage system users and their permissions</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <span className="text-sm text-gray-500">
                        Total: {totalUsers} users
                    </span>
                </div>
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

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        />
                    </div>

                    {/* Role Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>

                    {/* Email Verification Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Status</label>
                        <select
                            value={filters.verified}
                            onChange={(e) => handleFilterChange('verified', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                        >
                            <option value="">All</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => setFilters({
                            search: '',
                            role: '',
                            status: '',
                            verified: '',
                            page: 1,
                            limit: 10
                        })}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">
                                                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name || 'No name'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {user._id.slice(-8)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-black ${
                                                user.role === 'admin' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusToggle(user._id, user.isBlocked ? 'blocked' : 'active')}
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.isBlocked
                                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                            } transition-colors`}
                                        >
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.isEmailVerified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {user.isEmailVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{formatDate(user.createdAt)}</div>
                                        {user.lastLogin && (
                                            <div className="text-xs text-gray-400">
                                                Last: {formatDate(user.lastLogin)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/admin/users/${user._id}`}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => confirmDelete(user)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                disabled={user.role === 'admin'} // Prevent deleting admin users
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {users.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(filters.page - 1)}
                                disabled={filters.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={filters.page === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {((filters.page - 1) * filters.limit) + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(filters.page * filters.limit, totalUsers)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">{totalUsers}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handlePageChange(filters.page - 1)}
                                        disabled={filters.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= filters.page - 1 && page <= filters.page + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        page === filters.page
                                                            ? 'z-10 bg-black border-black text-white'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === filters.page - 2 ||
                                            page === filters.page + 2
                                        ) {
                                            return (
                                                <span
                                                    key={page}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                    
                                    <button
                                        onClick={() => handlePageChange(filters.page + 1)}
                                        disabled={filters.page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">Delete User</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={handleDeleteUser}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}