import React, { useState, useEffect } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductService } from '../services/ProductService';

const WishlistPage: React.FC = () => {
  const { wishlistItems, removeFromWishlist, isLoading, addToWishlist } = useWishlist();
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch product details for wishlist items from backend
    const fetchWishlistProducts = async () => {
      const products = await Promise.all(
        wishlistItems.map(async (productId) => {
          try {
            // Fetch each product from backend
            const product = await ProductService.getProductById(productId);
            return product;
          } catch (error) {
            console.warn(`Could not fetch product with ID: ${productId}. It might have been removed.`, error);
            removeFromWishlist(productId); // Remove invalid item from wishlist
            return null; // Return null if a product is not found
          }
        })
      );
      // Filter out any null values before setting the state
      setWishlistProducts(products.filter(product => product !== null));
    };
    fetchWishlistProducts();
  }, [wishlistItems, user, isLoading]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to view your wishlist
            </p>
            <div className="flex flex-col gap-4">
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Demo login for testing
                  const demoUser = {
                    ID: 'demo_user_123',
                    Name: 'Demo User',
                    Email: 'demo@example.com',
                    role: 'customer' as const
                  };
                  localStorage.setItem('ecommerce_user', JSON.stringify(demoUser));
                  window.location.reload();
                }}
              >
                Demo Login (for testing)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>);

  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="w-8 h-8 text-red-500 mr-3 fill-current" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>

        {wishlistProducts.length === 0 ?
        <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Start adding products you love to your wishlist and never lose track of them!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    // Add demo items to wishlist for testing
                    const demoProductIds = ['28dba92d-a56a-4770-87fe-a0213766807d'];
                    for (const productId of demoProductIds) {
                      await addToWishlist(productId);
                    }
                  }}
                >
                  Add Demo Items (for testing)
                </Button>
              </div>
            </CardContent>
          </Card> :

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) =>
          <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => removeFromWishlist(product.id)}>

                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
          )}
          </div>
        }

        {wishlistProducts.length > 0 &&
        <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to purchase?
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your favorite items to cart and complete your purchase today!
                </p>
                <Button asChild size="lg">
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        }
      </div>
    </div>);

};

export default WishlistPage;
