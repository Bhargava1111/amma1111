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
    <Link to={`/product/${product.id}`} className="block h-full">
      <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full flex flex-col">
        <CardContent className="p-0 flex-grow">
          <div className="relative overflow-hidden rounded-t-lg">
            <ImageFallback
              src={product.image}
              alt={product.name}
              className="w-full h-40 sm:h-48 md:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Quick Action Buttons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-2 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white transition-colors shadow-sm"
                onClick={handleWishlistClick}>

                <Heart
                  className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white transition-colors shadow-sm"
                onClick={handleQuickView}>

                <Eye className="w-4 h-4 text-gray-600 hover:text-blue-600" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white transition-colors shadow-sm"
                onClick={handleAddToComparison}>

                <Menu className="w-4 h-4 text-gray-600 hover:text-purple-600" />
              </Button>
            </div>
            {(selectedVariant ? selectedVariant.stock < 10 : product.stock_quantity < 10) &&
            <Badge
              variant="destructive"
              className="absolute bottom-2 right-2">

                Low Stock
              </Badge>
            }
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 text-xs">

              {product.category}
            </Badge>
          </div>
          
          <div className="p-3 sm:p-4">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                ({product.reviews} reviews)
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                ₹{(selectedVariant ? selectedVariant.price : product.price).toFixed(0)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {selectedVariant ? selectedVariant.stock : (product.stock_quantity || 0)} left
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
          <div className="w-full space-y-3">
            {/* Weight/Size Selector */}
            {product.variants && product.variants.length > 0 ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="touch-manipulation">
                <Select 
                  defaultValue={product.variants[0].weight}
                  onValueChange={handleVariantChange}
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[var(--radix-select-content-available-height)] overflow-y-auto">
                    {product.variants.map((variant) => (
                      <SelectItem 
                        key={variant.weight} 
                        value={variant.weight}
                        className="text-sm py-2.5">
                        {variant.weight}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            
            {/* Quantity Selector */}
            <div 
              className="flex items-center justify-between border rounded-md overflow-hidden touch-manipulation"
              onClick={(e) => e.stopPropagation()}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 px-3 rounded-none" 
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
                className="h-10 w-12 text-center p-0 border-0 rounded-none focus-visible:ring-0"
                onClick={(e) => e.stopPropagation()}
                disabled={selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 px-3 rounded-none" 
                onClick={incrementQuantity}
                disabled={quantity >= (selectedVariant ? selectedVariant.stock : (product.stock_quantity || 10)) || (selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full h-10 text-sm group-hover:bg-blue-600 transition-colors"
              disabled={selectedVariant ? selectedVariant.stock === 0 : product.stock_quantity === 0}>

              <ShoppingCart className="w-4 h-4 mr-2" />
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
