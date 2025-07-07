import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Check,
  Minus } from
'lucide-react';
import { Product } from '../types';

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({ isOpen, onClose }) => {
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    // Load compared products from localStorage
    const stored = localStorage.getItem('comparedProducts');
    if (stored) {
      setComparedProducts(JSON.parse(stored));
    }
  }, [isOpen]);

  const removeFromComparison = (productId: string) => {
    const updated = comparedProducts.filter((p) => p.id !== productId);
    setComparedProducts(updated);
    localStorage.setItem('comparedProducts', JSON.stringify(updated));

    toast({
      title: "Removed from comparison",
      description: "Product removed from comparison list.",
      duration: 2000
    });
  };

  const clearAll = () => {
    setComparedProducts([]);
    localStorage.removeItem('comparedProducts');
    toast({
      title: "Comparison cleared",
      description: "All products removed from comparison.",
      duration: 2000
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });

    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart.`,
      duration: 3000
    });
  };

  const handleWishlistClick = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const getFeaturesList = (product: Product) => {
    // Mock features for comparison
    return [
    'Traditional Recipe',
    'No Preservatives',
    'Authentic Taste',
    'Home-made Style',
    'Long Shelf Life'];

  };

  if (comparedProducts.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Comparison</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Products to Compare</h3>
            <p className="text-gray-600 mb-4">
              Add products to comparison from product pages to see them here.
            </p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        </DialogContent>
      </Dialog>);

  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Compare Products ({comparedProducts.length})</DialogTitle>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <td className="p-4 border-b border-gray-200 font-medium w-32">Products</td>
                {comparedProducts.map((product) =>
                <td key={product.id} className="p-4 border-b border-gray-200 text-center relative">
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromComparison(product.id)}
                    className="absolute top-2 right-2 w-6 h-6 p-0">

                      <X className="w-4 h-4" />
                    </Button>
                    <div className="space-y-2">
                      <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-gray-100">
                        <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover" />

                      </div>
                      <h3 className="font-semibold text-sm">{product.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </td>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Price Row */}
              <tr>
                <td className="p-4 border-b border-gray-200 font-medium">Price</td>
                {comparedProducts.map((product) =>
                <td key={`price-${product.id}`} className="p-4 border-b border-gray-200 text-center">
                    <span className="text-xl font-bold text-green-600">
                      Rs. {product.price.toFixed(2)}
                    </span>
                  </td>
                )}
              </tr>

              {/* Rating Row */}
              <tr>
                <td className="p-4 border-b border-gray-200 font-medium">Rating</td>
                {comparedProducts.map((product) =>
                <td key={`rating-${product.id}`} className="p-4 border-b border-gray-200 text-center">
                    <div className="flex justify-center items-center space-x-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) =>
                      <Star key={star} className="w-4 h-4 fill-current text-yellow-400" />
                      )}
                      </div>
                      <span className="text-sm text-gray-600">(4.5)</span>
                    </div>
                  </td>
                )}
              </tr>

              {/* Stock Row */}
              <tr>
                <td className="p-4 border-b border-gray-200 font-medium">Stock</td>
                {comparedProducts.map((product) =>
                <td key={`stock-${product.id}`} className="p-4 border-b border-gray-200 text-center">
                    <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} Available` : 'Out of Stock'}
                    </Badge>
                  </td>
                )}
              </tr>

              {/* Features Rows */}
              {getFeaturesList(comparedProducts[0]).map((feature, index) =>
              <tr key={`feature-${index}`}>
                  <td className="p-4 border-b border-gray-200 font-medium">{feature}</td>
                  {comparedProducts.map((product) =>
                <td key={`${product.id}-feature-${index}`} className="p-4 border-b border-gray-200 text-center">
                      {Math.random() > 0.3 ?
                  <Check className="w-5 h-5 text-green-600 mx-auto" /> :

                  <Minus className="w-5 h-5 text-gray-400 mx-auto" />
                  }
                    </td>
                )}
                </tr>
              )}

              {/* Actions Row */}
              <tr>
                <td className="p-4 font-medium">Actions</td>
                {comparedProducts.map((product) =>
                <td key={`actions-${product.id}`} className="p-4 text-center">
                    <div className="space-y-2">
                      <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm">

                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                      variant={isInWishlist(product.id) ? "default" : "outline"}
                      onClick={() => handleWishlistClick(product)}
                      className="w-full"
                      size="sm">

                        <Heart className={`w-4 h-4 mr-1 ${
                      isInWishlist(product.id) ? 'fill-current text-red-500' : ''}`
                      } />
                        {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>);

};

export default ProductComparison;
