import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Mock data for testing
  const mockReviews = useMemo(() => [
    {
      _id: '1',
      user: {
        name: 'Sarah Johnson'
      },
      rating: 5,
      title: 'Absolutely Amazing!',
      comment: 'This cocktail exceeded my expectations. The flavor is perfectly balanced and refreshing. I\'ve ordered it multiple times and it\'s consistently excellent. Highly recommend for anyone who loves quality cocktails!',
      createdAt: '2024-06-10T10:30:00Z'
    },
    {
      _id: '2',
      user: {
        name: 'Mike Chen'
      },
      rating: 4,
      title: 'Great taste, quick delivery',
      comment: 'Really enjoyed this cocktail. The organic ingredients really make a difference in taste. Only minor complaint is that I wish it came in larger bottles. Will definitely order again.',
      createdAt: '2024-06-08T15:45:00Z'
    },
    {
      _id: '3',
      user: {
        name: 'Emily Rodriguez'
      },
      rating: 5,
      title: 'Perfect for summer parties',
      comment: 'Bought this for a summer BBQ and everyone loved it! The spritz is light, refreshing, and not too sweet. The packaging is also beautiful. Great product overall.',
      createdAt: '2024-06-05T20:15:00Z'
    },
    {
      _id: '4',
      user: {
        name: 'David Wilson'
      },
      rating: 3,
      title: 'Good but not exceptional',
      comment: 'It\'s a decent cocktail but I\'ve had better. The price point is reasonable and quality is good, but the flavor didn\'t wow me as much as I hoped.',
      createdAt: '2024-06-03T12:20:00Z'
    },
    {
      _id: '5',
      user: {
        name: 'Lisa Thompson'
      },
      rating: 5,
      title: 'My new favorite!',
      comment: 'I\'m obsessed with this cocktail! The organic blood orange flavor is incredible and it\'s the perfect alcohol content. I\'ve already recommended it to all my friends.',
      createdAt: '2024-06-01T18:30:00Z'
    }
  ], []);

  const mockStats = useMemo(() => ({
    averageRating: 4.4,
    totalReviews: 5,
    ratingDistribution: [0, 0, 1, 1, 3] // [1-star, 2-star, 3-star, 4-star, 5-star]
  }), []);

  // Fetch reviews with mock data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data for now
        setReviews(mockReviews);
        setStats(mockStats);
        
        // Uncomment below for real API call
        /*
        const response = await fetch(`${API_URL}/api/reviews/${productId}`);
        const result = await response.json();
        
        if (result.success) {
          setReviews(result.data.reviews || []);
          setStats(result.data.stats || mockStats);
        }
        */
        
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to mock data on error
        setReviews(mockReviews);
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, API_URL, mockReviews, mockStats]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    try {
      setSubmitting(true);
      
      // Mock submission for testing
      const mockNewReview = {
        _id: Date.now().toString(),
        user: {
          name: user.name || 'Current User'
        },
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        createdAt: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update reviews list
      setReviews([mockNewReview, ...reviews]);
      
      // Update stats
      setStats(prevStats => {
        const newTotalReviews = prevStats.totalReviews + 1;
        const newAverageRating = ((prevStats.averageRating * prevStats.totalReviews) + newReview.rating) / newTotalReviews;
        const newRatingDistribution = [...prevStats.ratingDistribution];
        newRatingDistribution[newReview.rating - 1]++;
        
        return {
          averageRating: newAverageRating,
          totalReviews: newTotalReviews,
          ratingDistribution: newRatingDistribution
        };
      });

      // Reset form
      setNewReview({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      
      // Uncomment below for real API call
      /*
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          ...newReview
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setReviews([result.data, ...reviews]);
        setNewReview({ rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
        // Update stats...
      }
      */
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render star rating
  const renderStars = (rating, size = 'w-4 h-4') => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`${size} ${index < rating ? 'text-black' : 'text-gray-300'}`}
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

  if (loading) {
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

          {/* Write Review Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              disabled={!user}
              className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {!user ? 'Login to Review' : 'Write a Review'}
            </button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>
          
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
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
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
              
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">{review.comment}</p>

              {/* Helpful Actions */}
              <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs md:text-sm text-gray-500">Was this review helpful?</span>
                <button className="text-xs md:text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  👍 Yes
                </button>
                <button className="text-xs md:text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  👎 No
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;