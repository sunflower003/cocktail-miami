import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0]
  });
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [userReview, setUserReview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Show toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_URL}/api/reviews/product/${productId}?page=${page}&limit=10&sort=${sortBy}`
      );
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data.reviews);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
        
        // Check if current user has reviewed this product
        const currentUserReview = result.data.reviews.find(
          review => review.user._id === user?._id
        );
        setUserReview(currentUserReview);
      } else {
        showToast(result.message || 'Failed to load reviews', 'error');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(currentPage);
    }
  }, [productId, currentPage, sortBy]);

  // Submit review (create or update)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to submit a review', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const reviewData = {
        product: productId,
        ...newReview
      };

      const url = editingReview 
        ? `${API_URL}/api/reviews/${editingReview._id}`
        : `${API_URL}/api/reviews`;
      
      const method = editingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const result = await response.json();
      
      if (result.success) {
        showToast(
          editingReview ? 'Review updated successfully' : 'Review submitted successfully',
          'success'
        );
        
        // Reset form and close
        setNewReview({ rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
        setEditingReview(null);
        
        // Refresh reviews
        fetchReviews(currentPage);
      } else {
        showToast(result.message || 'Failed to submit review', 'error');
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Review deleted successfully', 'success');
        setUserReview(null);
        fetchReviews(currentPage);
      } else {
        showToast(result.message || 'Failed to delete review', 'error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review', 'error');
    }
  };

  // Edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setNewReview({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
    setShowReviewForm(true);
  };

  // Vote helpful
  // const handleVoteHelpful = async (reviewId, type) => {
  //   if (!user) {
  //     showToast('Please login to vote', 'error');
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem('token');
      
  //     const response = await fetch(`${API_URL}/api/reviews/${reviewId}/helpful`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({ type })
  //     });

  //     const result = await response.json();
      
  //     if (result.success) {
  //       showToast('Vote recorded', 'success');
  //       // Optionally refresh reviews to show updated vote counts
  //       fetchReviews(currentPage);
  //     } else {
  //       showToast(result.message || 'Failed to vote', 'error');
  //     }
  //   } catch (error) {
  //     console.error('Error voting:', error);
  //     showToast('Failed to vote', 'error');
  //   }
  // };

  // Render star rating
  const renderStars = (rating, size = 'w-4 h-4') => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`${size} ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Reviews Header */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Rating Summary */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Customer Reviews</h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(Math.round(stats.averageRating), 'w-5 h-5')}
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-600 text-sm md:text-base">
                  ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {/* Rating Distribution */}
            {stats.totalReviews > 0 && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingDistribution[star - 1] || 0;
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  
                  return (
                    <div key={star} className="flex items-center space-x-2 text-sm">
                      <span className="w-3">{star}</span>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div className="w-24 md:w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600">{count} reviews</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 space-y-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>

            {/* Write/Edit Review Button */}
            <div>
              {userReview ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleEditReview(userReview)}
                    className="w-full md:w-auto bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
                  >
                    Edit My Review
                  </button>
                  <button
                    onClick={() => handleDeleteReview(userReview._id)}
                    className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete My Review
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  disabled={!user}
                  className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {!user ? 'Login to Review' : 'Write a Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingReview ? 'Edit Your Review' : 'Write Your Review'}
          </h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 md:w-8 md:h-8 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm md:text-base"
                placeholder="Give your review a title"
                required
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm md:text-base"
                placeholder="Share your experience with this product"
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newReview.comment.length}/1000 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setNewReview({ rating: 5, title: '', comment: '' });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                {submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 md:space-y-6 text-left">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <div className="max-w-md mx-auto px-4">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.93-6.93c-.04-.395-.04-.8 0-1.195A8.001 8.001 0 0113 4c4.418 0 8 3.582 8 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 text-sm md:text-base">Be the first to review this product!</p>
            </div>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm md:text-base">
                      {review.user?.name || 'Anonymous'}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs md:text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h5 className="font-medium text-gray-900 mb-2 text-sm md:text-base">{review.title}</h5>
              )}
              
              <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-4">{review.comment}</p>

              {/* Admin Reply */}
              {review.adminReply && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h6 className="font-medium text-gray-900 text-sm mb-2">Store Response:</h6>
                  <p className="text-gray-700 text-sm">{review.adminReply}</p>
                </div>
              )}

              {/* Helpful Actions */}
              {/* <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <span className="text-xs md:text-sm text-gray-500">Was this review helpful?</span>
                <button 
                  onClick={() => handleVoteHelpful(review._id, 'yes')}
                  className="text-xs md:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  👍 Yes ({review.helpfulVotes?.yes?.length || 0})
                </button>
                <button 
                  onClick={() => handleVoteHelpful(review._id, 'no')}
                  className="text-xs md:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  👎 No ({review.helpfulVotes?.no?.length || 0})
                </button>
              </div> */}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹ Previous
            </button>
            
            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 rounded ${
                    currentPage === pageNumber
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNext}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;