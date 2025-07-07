import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Truck,
  Shield,
  RotateCcw } from
'lucide-react';
import { Product } from '../types';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('250 Grams');

  if (!product) return null;

  const productVariants = [
  { value: '250 Grams', label: '250 Grams', priceMultiplier: 1 },
  { value: '500 Grams', label: '500 Grams', priceMultiplier: 1.8 },
  { value: '750 Grams', label: '750 Grams', priceMultiplier: 2.5 },
  { value: '1000 Grams', label: '1000 Grams', priceMultiplier: 3.2 }];


  const currentVariant = productVariants.find((v) => v.value === selectedVariant);
  const currentPrice = product.price * (currentVariant?.priceMultiplier || 1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: `${product.name} (${selectedVariant})`,
        price: currentPrice,
        image: product.image,
        category: product.category
      });
    }

    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} (${selectedVariant}) added to your cart.`,
      duration: 3000
    });
    onClose();
  };

  const handleWishlistClick = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick View</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />

            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2 bg-orange-100 text-orange-800">
                {product.category}
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {product.description || 'Delicious traditional product made with authentic ingredients and time-tested recipes.'}
              </p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) =>
                  <Star key={star} className="w-4 h-4 fill-current text-yellow-400" />
                  )}
                </div>
                <span className="text-sm text-gray-600">(4.5) • 24 reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-green-600">
                Rs. {currentPrice.toFixed(2)}
              </span>
              {currentVariant?.priceMultiplier !== 1 &&
              <span className="text-lg text-gray-500 line-through ml-2">
                  Rs. {product.price.toFixed(2)}
                </span>
              }
            </div>

            {/* Variant Selector */}
            <div className="space-y-3">
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {productVariants.map((variant) =>
                  <SelectItem key={variant.value} value={variant.value}>
                      {variant.label}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg border-2">

                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="w-10 h-10 rounded-lg border-2">

                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant={isInWishlist(product.id) ? "default" : "outline"}
                    size="sm"
                    onClick={handleWishlistClick}
                    className="w-12 h-12 rounded-lg">

                    <Heart className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-current text-red-500' : 'text-gray-600'}`
                    } />
                  </Button>
                  
                  <Button
                    onClick={handleAddToCart}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">

                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Truck className="w-5 h-5 text-green-600" />
                <span>Free Shipping on orders over Rs. 999</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>100% Secure Payment</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span>Easy 30-day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};

export default ProductQuickView;
