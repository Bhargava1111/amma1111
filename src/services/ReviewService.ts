const REVIEWS_TABLE_ID = '10400';
const NOTIFICATIONS_TABLE_ID = '10412';

export interface Review {
  id: number;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string;
  review_date: string;
  verified_purchase: boolean;
}

export class ReviewService {
  // Add a new review
  static async addReview(params: {
    userId: string;
    productId: string;
    rating: number;
    reviewText: string;
    verifiedPurchase?: boolean;
  }) {
    try {
      const { userId, productId, rating, reviewText, verifiedPurchase = false } = params;

      // Check if user has already reviewed this product
      const { data: existingData, error: checkError } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userId },
        { name: 'product_id', op: 'Equal', value: productId }]

      });

      if (checkError) throw new Error(checkError);

      if (existingData?.List && existingData.List.length > 0) {
        throw new Error('You have already reviewed this product');
      }

      // Create review
      const reviewData = {
        user_id: userId,
        product_id: productId,
        rating: rating,
        review_text: reviewText,
        review_date: new Date().toISOString(),
        verified_purchase: verifiedPurchase
      };

      const { error } = await window.ezsite.apis.tableCreate(REVIEWS_TABLE_ID, reviewData);
      if (error) throw new Error(error);

      // Create notification for admins
      try {
        await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
          user_id: 'admin',
          title: 'New Product Review',
          message: `A new ${rating}-star review has been posted for product ${productId}`,
          type: 'system',
          channel: 'in_app',
          status: 'sent',
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString()
        });
      } catch (notifError) {
        console.error('Error creating review notification:', notifError);
      }

      // Send email notification to admin
      try {
        await window.ezsite.apis.sendEmail({
          from: 'support@ezsite.ai',
          to: ['admin@company.com'],
          subject: 'New Product Review',
          html: `
            <h2>New Product Review</h2>
            <p><strong>Product ID:</strong> ${productId}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Rating:</strong> ${rating}/5 stars</p>
            <p><strong>Review:</strong> ${reviewText}</p>
            <p><strong>Verified Purchase:</strong> ${verifiedPurchase ? 'Yes' : 'No'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending review email:', emailError);
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Get reviews for a product
  static async getProductReviews(productId: string, params: {
    pageNo?: number;
    pageSize?: number;
    sortBy?: 'rating' | 'date';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const { pageNo = 1, pageSize = 10, sortBy = 'date', sortOrder = 'desc' } = params;

      const orderField = sortBy === 'rating' ? 'rating' : 'ID';

      const { data, error } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: orderField,
        IsAsc: sortOrder === 'asc',
        Filters: [
        { name: 'product_id', op: 'Equal', value: productId }]

      });

      if (error) throw new Error(error);

      return {
        reviews: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }

  // Get review statistics for a product
  static async getProductRatingStats(productId: string) {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        Filters: [
        { name: 'product_id', op: 'Equal', value: productId }]

      });

      if (error) throw new Error(error);

      const reviews = data?.List || [];
      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((review: any) => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      throw error;
    }
  }

  // Get user's reviews
  static async getUserReviews(userId: string, params: {
    pageNo?: number;
    pageSize?: number;
  } = {}) {
    try {
      const { pageNo = 1, pageSize = 10 } = params;

      const { data, error } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userId }]

      });

      if (error) throw new Error(error);

      return {
        reviews: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  // Update a review
  static async updateReview(reviewId: number, userId: string, params: {
    rating: number;
    reviewText: string;
  }) {
    try {
      const { rating, reviewText } = params;

      // Verify review belongs to user
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'id', op: 'Equal', value: reviewId },
        { name: 'user_id', op: 'Equal', value: userId }]

      });

      if (fetchError) throw new Error(fetchError);

      const review = data?.List?.[0];
      if (!review) throw new Error('Review not found or access denied');

      // Update review
      const { error } = await window.ezsite.apis.tableUpdate(REVIEWS_TABLE_ID, {
        id: reviewId,
        rating: rating,
        review_text: reviewText,
        review_date: new Date().toISOString() // Update the date to show it was modified
      });

      if (error) throw new Error(error);

      return { success: true };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  static async deleteReview(reviewId: number, userId: string) {
    try {
      // Verify review belongs to user
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'id', op: 'Equal', value: reviewId },
        { name: 'user_id', op: 'Equal', value: userId }]

      });

      if (fetchError) throw new Error(fetchError);

      const review = data?.List?.[0];
      if (!review) throw new Error('Review not found or access denied');

      // Delete review
      const { error } = await window.ezsite.apis.tableDelete(REVIEWS_TABLE_ID, reviewId);

      if (error) throw new Error(error);

      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Check if user can review product (has purchased it)
  static async canUserReviewProduct(userId: string, productId: string): Promise<boolean> {
    try {
      // Check if user has already reviewed this product
      const { data: existingReview, error: reviewError } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userId },
        { name: 'product_id', op: 'Equal', value: productId }]

      });

      if (reviewError) {
        console.error('Error checking existing review:', reviewError);
        return false;
      }

      // If user has already reviewed, they can't review again
      if (existingReview?.List && existingReview.List.length > 0) {
        return false;
      }

      // For now, allow all authenticated users to review
      // In a real implementation, you'd check if they've purchased the product
      return true;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return false;
    }
  }

  // Get all reviews (admin)
  static async getAllReviews(params: {
    pageNo?: number;
    pageSize?: number;
    productId?: string;
    rating?: number;
  } = {}) {
    try {
      const { pageNo = 1, pageSize = 20, productId, rating } = params;

      const filters: any[] = [];

      if (productId) {
        filters.push({
          name: 'product_id',
          op: 'Equal',
          value: productId
        });
      }

      if (rating) {
        filters.push({
          name: 'rating',
          op: 'Equal',
          value: rating
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(REVIEWS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw new Error(error);

      return {
        reviews: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  }
}
