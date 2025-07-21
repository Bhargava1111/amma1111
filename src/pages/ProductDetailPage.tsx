import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { ProductService } from '../services/ProductService';
import ProductReviews from '../components/ProductReviews';
import ProductComparison from '../components/ProductComparison';
import SEOHead from '../components/SEO/SEOHead';
import StructuredData from '../components/SEO/StructuredData';
import { generateProductSEOTitle, generateBreadcrumbs, generateProductKeywords } from '../utils/seoUtils';
import {
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
  Plus,
  Minus,
  Eye,
  Menu
} from 'lucide-react';

interface ProductVariant {
  id: number;
  weight: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{id: string;}>();
  console.log('ProductDetailPage rendered with id:', id);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('250 Grams');
  const [showComparison, setShowComparison] = useState(false);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Default product variants for weight/size selection
  const defaultVariants = [
  { value: '250 Grams', label: '250 Grams', priceMultiplier: 1, price: 199 },
  { value: '500 Grams', label: '500 Grams', priceMultiplier: 1.8, price: 359 },
  { value: '750 Grams', label: '750 Grams', priceMultiplier: 2.5, price: 499 },
  { value: '1000 Grams', label: '1000 Grams', priceMultiplier: 3.2, price: 639 }];


  // Fetch product by ID from backend
  useEffect(() => {
    const fetchProduct = async () => {
      setLoadingProduct(true);
      if (!id) {
        setProduct(null);
        setLoadingProduct(false);
        return;
      }
      try {
        const prod = await ProductService.getProductById(id);
        console.log('Fetched product:', prod); // Add this line for debugging
        setProduct(prod);
      } catch (err) {
        console.error('Error fetching product in ProductDetailPage:', err); // Log the error
        setProduct(null);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      loadProductVariants();
    }
    // eslint-disable-next-line
  }, [product]);

  const loadProductVariants = async () => {
    try {
      setIsLoading(true);
      // Try to load variants from database
      const { data, error } = await window.ezsite.apis.tablePage(12221, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'id',
        IsAsc: true,
        Filters: [
        { name: 'product_id', op: 'Equal', value: id || '' }]

      });

      if (error) {
        console.warn('Error loading variants:', error);
        return;
      }

      if (data?.List?.length > 0) {
        setProductVariants(data.List);
      }
    } catch (error) {
      console.error('Error loading product variants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-lg text-gray-600">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Card>
      </div>);
  }

  // Get current variant price
  const getCurrentVariantPrice = () => {
    const dbVariant = productVariants.find((v) => v.weight === selectedVariant);
    if (dbVariant) {
      return dbVariant.price;
    }

    const defaultVariant = defaultVariants.find((v) => v.value === selectedVariant);
    return defaultVariant?.price || product.price;
  };

  const currentPrice = getCurrentVariantPrice();

  const productImages = [
  product.image_url || product.image, // Use the actual product image first
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', // Fallback 1
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600']; // Fallback 2


  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: `${product.name} (${selectedVariant})`,
        price: currentPrice,
        image: productImages[0],
        category: product.category
      });
    }

    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} (${selectedVariant}) added to your cart.`,
      duration: 3000
    });
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product.stock_quantity || 100)) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlistClick = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const getAvailableVariants = () => {
    if (productVariants.length > 0) {
      return productVariants.filter((v) => v.is_active);
    }
    return defaultVariants;
  };

  // Generate SEO data for the product
  const seoTitle = generateProductSEOTitle(product.name, product.category);
  const seoDescription = product.description || `Premium ${product.name} from MANAfoods. High quality ${product.category.toLowerCase()} with fast delivery and best prices.`;
  const seoKeywords = generateProductKeywords({
    id: product.id,
    name: product.name,
    description: product.description,
    price: currentPrice,
    category: product.category,
    brand: 'MANAfoods',
    images: productImages,
    inStock: (product.stock_quantity || 0) > 0,
    rating: product.rating,
    reviewCount: product.review_count,
    sku: product.sku || product.id
  });

  const breadcrumbs = generateBreadcrumbs(
    window.location.pathname, 
    product.name, 
    product.category
  );

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        type="product"
        image={productImages[0]}
        price={currentPrice.toString()}
        currency="INR"
        availability={product.stock_quantity > 0 ? "in stock" : "out of stock"}
        brand="MANAfoods"
        category={product.category}
      />
      
      <StructuredData
        product={{
          name: product.name,
          description: product.description,
          image: productImages,
          brand: 'MANAfoods',
          sku: product.sku || product.id,
          offers: {
            price: currentPrice.toString(),
            currency: 'INR',
            availability: product.stock_quantity > 0 ? 'InStock' : 'OutOfStock',
            url: window.location.href
          },
          ...(product.rating && {
            aggregateRating: {
              ratingValue: product.rating,
              reviewCount: product.review_count || 0
            }
          })
        }}
        breadcrumb={{ items: breadcrumbs }}
      />
      
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gray-700">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-gray-700">
            Products
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/products?category=${product.category}`)} className="hover:text-gray-700">
            {product.category}
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border shadow-2xl p-8">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-yellow-100/20 rounded-xl"></div>
                
                {/* Product arrangement matching the image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Main product composition */}
                  <div className="relative w-4/5 h-4/5 flex items-center justify-center">
                    {/* Wicker mat background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full opacity-60 transform rotate-12"></div>
                    
                    {/* Main pickle bowl */}
                    <div className="relative z-10">
                      <img
                        src={`${(import.meta.env.VITE_PRODUCTION_URL || '').replace(/\/$/, '')}/${(productImages[selectedImage] || '').replace(/^\//, '')}`}
                        alt={product.name}
                        className="w-48 h-48 object-cover rounded-full drop-shadow-2xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-8 right-8 w-16 h-20 bg-gradient-to-b from-green-200 to-green-300 rounded-lg shadow-lg opacity-90 transform rotate-12">
                      <div className="w-full h-full bg-gradient-to-b from-yellow-200 to-orange-300 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-green-800 transform -rotate-12">{product.name}</span>
                      </div>
                    </div>
                    
                    {/* Tomatoes */}
                    <div className="absolute bottom-12 left-8 w-8 h-8 bg-red-500 rounded-full shadow-lg opacity-90"></div>
                    <div className="absolute bottom-16 left-16 w-6 h-6 bg-red-600 rounded-full shadow-lg opacity-80"></div>
                    
                    {/* Spice jar */}
                    <div className="absolute bottom-8 right-12 w-6 h-10 bg-gradient-to-b from-amber-600 to-amber-800 rounded-sm shadow-lg opacity-80"></div>
                    
                    {/* Wooden spoon */}
                    <div className="absolute top-16 left-12 w-12 h-2 bg-amber-600 rounded-full shadow-lg opacity-70 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col space-y-3">
              <Button
                variant={isInWishlist(product.id) ? "default" : "outline"}
                size="sm"
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white"
                onClick={handleWishlistClick}>
                <Heart className={`w-5 h-5 ${
                isInWishlist(product.id) ? 'fill-current text-red-500' : 'text-gray-600'}`
                } />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white">
                <Eye className="w-5 h-5 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const stored = localStorage.getItem('comparedProducts');
                  const comparedProducts = stored ? JSON.parse(stored) : [];

                  if (comparedProducts.find((p: any) => p.id === product.id)) {
                    toast({
                      title: "Already in comparison",
                      description: "This product is already in your comparison list.",
                      duration: 2000
                    });
                    setShowComparison(true);
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
                }}
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white">
                <Menu className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3 bg-orange-100 text-orange-800 px-3 py-1">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {product.description}
              </p>
              
              {/* Price Display */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-green-600">
                  ₹{currentPrice}
                </span>
                <span className="ml-3 text-lg text-gray-500 line-through">
                  ₹{Math.round(currentPrice * 1.2)}
                </span>
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  Save ₹{Math.round(currentPrice * 0.2)}
                </span>
              </div>
            </div>

            {/* Weight/Size Selector */}
            <div className="space-y-3">
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableVariants().map((variant: any) => (
                    <SelectItem
                      key={variant.weight || variant.value}
                      value={variant.weight || variant.value}
                    >
                      {variant.weight || variant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Add to Cart */}
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
                    disabled={quantity >= (product.stock_quantity || 100)}
                    className="w-10 h-10 rounded-lg border-2">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={(product.stock_quantity || 100) === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  ADD
                </Button>
              </div>
            </div>

            <Separator />

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Product Features</h3>
                <ul className="space-y-2 text-gray-600">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Shipping & Returns */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over ₹499</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-gray-600">7-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="mb-16">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products section removed. */}
        
        {/* Comparison Modal */}
        <ProductComparison
          isOpen={showComparison}
          onClose={() => setShowComparison(false)} />

      </div>
    </div>
    </>
  );

};

export default ProductDetailPage;
