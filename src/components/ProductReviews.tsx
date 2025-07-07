import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, User, Calendar, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Review {
  ID: number;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string;
  review_date: string;
  verified_purchase: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Debug logging to ensure we're using the latest version
  console.log('ProductReviews component loaded - Version with enhanced keys');

  const fetchReviews = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(10400, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "review_date",
        IsAsc: false,
        Filters: [
        {
          name: "product_id",
          op: "Equal",
          value: productId
        }]

      });

      if (error) throw error;
      const reviewsList = data?.List || [];
      console.log('Fetched reviews:', reviewsList.length, 'reviews with IDs:', reviewsList.map(r => r.ID));
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review",
        variant: "destructive"
      });
      return;
    }

    if (!newReview.text.trim()) {
      toast({
        title: "Review Required",
        description: "Please write a review before submitting",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await window.ezsite.apis.tableCreate(10400, {
        user_id: user.ID,
        product_id: productId,
        rating: newReview.rating,
        review_text: newReview.text,
        review_date: new Date().toISOString(),
        verified_purchase: false // This would need to be checked against actual orders
      });

      if (error) throw error;

      setNewReview({ rating: 5, text: '' });
      setShowReviewForm(false);
      await fetchReviews();

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!"
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={`star-${star}-${interactive ? 'interactive' : 'static'}`}
            className={`w-5 h-5 ${
              star <= rating ?
                'text-yellow-400 fill-current' :
                'text-gray-300'} ${
              interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 ?
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length :
    0;

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={`loading-skeleton-${i}`} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <div className="flex items-center space-x-4 mt-2">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
        
        {user && (
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            disabled={reviews.some((review) => review.user_id === user.ID)}
          >
            {reviews.some((review) => review.user_id === user.ID) ?
              'Review Already Submitted' :
              'Write a Review'
            }
          </Button>
        )}
      </div>

      {showReviewForm && (
        <Card key="review-form-card">
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              {renderStars(newReview.rating, true, (rating) =>
                setNewReview((prev) => ({ ...prev, rating }))
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <Textarea
                value={newReview.text}
                onChange={(e) => setNewReview((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={submitReview} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card key="no-reviews-card">
            <CardContent className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No reviews yet. Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review, index) => {
            const reviewKey = `review-${review.ID}-${index}-${review.user_id}`;
            console.log('Rendering review with key:', reviewKey);
            return (
              <Card key={reviewKey}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Customer</span>
                          {review.verified_purchase && (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(review.review_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {review.review_text}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
