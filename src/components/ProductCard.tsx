import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageFallback from '@/components/ui/image-fallback';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Product, ProductVariant } from '../types';
import { Star, ShoppingCart, Heart, Eye, Menu, Plus, Minus } from 'lucide-react';
import ProductQuickView from './ProductQuickView';
import ProductComparison from './ProductComparison';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showQuickView, setShowQuickView] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);

  // Set default variant if available
  React.useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product.variants]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add the product with the selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: selectedVariant ? selectedVariant.price : product.price,
        image: product.image,
        category: product.category
      });
    }

    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${product.name} ${selectedVariant ? `(${selectedVariant.weight})` : ''} added to your cart.`,
      duration: 2000
    });
    
    // Reset quantity after adding to cart
    setQuantity(1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleAddToComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = localStorage.getItem('comparedProducts');
    const comparedProducts = stored ? JSON.parse(stored) : [];

    if (comparedProducts.find((p: Product) => p.id === product.id)) {
      toast({
        title: "Already in comparison",
        description: "This product is already in your comparison list.",
        duration: 2000
      });
      return;
    }

    if (comparedProducts.length >= 4) {
      toast({
        title: "Comparison limit reached",
        description: "You can compare up to 4 products at a time.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    comparedProducts.push(product);
    localStorage.setItem('comparedProducts', JSON.stringify(comparedProducts));

    toast({
      title: "Added to comparison",
      description: `${product.name} added to comparison list.`,
      duration: 2000
    });

    setShowComparison(true);
  };

  const incrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < (selectedVariant ? selectedVariant.stock : (product.stock_quantity || 10))) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (selectedVariant ? selectedVariant.stock : (product.stock_quantity || 10))) {
      setQuantity(value);
    }
  };

  const handleVariantChange = (value: string) => {
    if (product.variants) {
      const variant = product.variants.find(v => v.weight === value);
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  };

  const toggleVariantDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVariantDropdown(!showVariantDropdown);
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full group">
      <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0 flex-grow">
          <div className="relative overflow-hidden">
            <ImageFallback
              src={`${(import.meta.env.VITE_PRODUCTION_URL || '').replace(/\/$/, '')}/${(product.image_url || product.image || '').replace(/^\//, '').replace(/^\./, '')}`}
              alt={product.name}
              className="w-full h-32 sm:h-40 md:h-48 lg:h-52 object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick Action Buttons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-1 sm:space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 sm:w-8 sm:h-8 p-0 bg-white/90 hover:bg-white transition-all duration-300 shadow-lg rounded-full backdrop-blur-sm"
                onClick={handleWishlistClick}>

                <Heart
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${
                    isInWishlist(product.id) 
                      ? 'text-red-500 fill-red-500 animate-pulse' 
                      : 'text-gray-600 hover:text-red-500 hover:scale-110'
                  }`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 sm:w-8 sm:h-8 p-0 bg-white/90 hover:bg-white transition-all duration-300 shadow-lg rounded-full backdrop-blur-sm"
                onClick={handleQuickView}>

                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 sm:w-8 sm:h-8 p-0 bg-white/90 hover:bg-white transition-all duration-300 shadow-lg rounded-full backdrop-blur-sm"
                onClick={handleAddToComparison}>

                <Menu className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-purple-600 transition-all duration-300 hover:scale-110" />
              </Button>
            </div>

            {/* Stock Badge */}
            {(selectedVariant ? selectedVariant.stock < 10 : product.stock_quantity < 10) &&
            <Badge
              variant="destructive"
              className="absolute bottom-2 right-2 text-xs animate-pulse bg-gradient-to-r from-red-500 to-pink-500">

                Low Stock
              </Badge>
            }

            {/* Category Badge */}
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 text-xs bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white border-0 backdrop-blur-sm">

              {product.category}
            </Badge>

            {/* Discount Badge (if applicable) */}
            {product.discount && (
              <Badge
                variant="destructive"
                className="absolute top-8 left-2 text-xs bg-gradient-to-r from-green-500 to-emerald-500 animate-bounce">
                {product.discount}% OFF
              </Badge>
            )}
          </div>
          
          <div className="p-2 sm:p-3 lg:p-4">
            <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
            
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-2 h-2 sm:w-3 sm:h-3 transition-colors duration-300 ${
                        star <= (product.rating || 0) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-700">{product.rating}</span>
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviews})
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ₹{(selectedVariant ? selectedVariant.price : product.price).toFixed(0)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-500 line-through">
                    ₹{product.originalPrice.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">
                  {selectedVariant ? selectedVariant.stock : (product.stock_quantity || 0)} left
                </span>
                {(selectedVariant ? selectedVariant.stock : product.stock_quantity) > 10 && (
                  <span className="text-xs text-green-600 font-medium">In Stock</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-2 sm:p-3 lg:p-4 pt-0 mt-auto">
          <div className="w-full space-y-2 sm:space-y-3">
            {/* Weight/Size Selector */}
            {product.variants && product.variants.length > 0 ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="touch-manipulation">
                <Select 
                  defaultValue={product.variants[0].weight}
                  onValueChange={handleVariantChange}
                >
                  <SelectTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-300">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[var(--radix-select-content-available-height)] overflow-y-auto">
                    {product.variants.map((variant) => (
                      <SelectItem 
                        key={variant.weight} 
                        value={variant.weight}
                        className="text-xs sm:text-sm py-2">
                        <div className="flex justify-between items-center w-full">
                          <span>{variant.weight}</span>
                          <span className="text-green-600 font-medium">₹{variant.price.toFixed(0)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            
            {/* Quantity Selector */}
            <div 
              className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg overflow-hidden touch-manipulation border border-blue-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 sm:h-10 px-2 sm:px-3 rounded-none hover:bg-blue-100 transition-colors duration-300" 
                onClick={decrementQuantity}
                disabled={quantity <= 1 || (selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <Input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={selectedVariant ? selectedVariant.stock : (product.stock_quantity || 10)}
                className="h-8 sm:h-10 w-10 sm:w-12 text-center p-0 border-0 rounded-none focus-visible:ring-0 bg-transparent text-xs sm:text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
                disabled={selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 sm:h-10 px-2 sm:px-3 rounded-none hover:bg-blue-100 transition-colors duration-300" 
                onClick={incrementQuantity}
                disabled={quantity >= (selectedVariant ? selectedVariant.stock : (product.stock_quantity || 10)) || (selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg"
              disabled={selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0}>

              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {selectedVariant ? (selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart') : (product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart')}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)} />

      
      {/* Comparison Modal */}
      <ProductComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)} />

    </Link>);

};

export default ProductCard;
