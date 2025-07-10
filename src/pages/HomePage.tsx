import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ProductCard from '../components/ProductCard';
import { mockProducts, categories, fetchProducts } from '../data/products';
import {
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  ArrowRight,
  Star,
  Smartphone,
  Shirt,
  Home,
  Watch,
  Camera,
  Headphones as HeadphonesIcon } from
'lucide-react';

// Mock banners for fallback/testing
const mockBanners = [
  {
    id: '1',
    title: 'Premium Pickles Collection',
    subtitle: 'Authentic Homemade Flavors',
    description: 'Discover our traditional pickles made with fresh ingredients and time-honored recipes.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&h=600&fit=crop&auto=format',
    link: '/products?category=pickles',
    cta: 'Shop Now'
  },
  {
    id: '2',
    title: 'Fresh & Organic',
    subtitle: 'Farm to Table Quality',
    description: 'Experience the taste of nature with our organic, preservative-free pickle varieties.',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&h=600&fit=crop&auto=format',
    link: '/products?category=organic',
    cta: 'Explore'
  },
  {
    id: '3',
    title: 'Special Offers',
    subtitle: 'Up to 30% Off',
    description: 'Limited time deals on your favorite pickle varieties. Stock up and save big!',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop&auto=format',
    link: '/products?sale=true',
    cta: 'Save Now'
  }
];

const HomePage: React.FC = () => {
console.log('HomePage component rendered');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [featuredProducts, setFeaturedProducts] = useState(mockProducts().slice(0, 6));
  const [topRatedProducts, setTopRatedProducts] = useState(mockProducts().slice(0, 6));
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  useEffect(() => {
    // Load real products
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        setFeaturedProducts(products.slice(0, 6));
        setTopRatedProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Error loading products:', error);
        // Keep fallback products
      }
    };
    loadProducts();
  }, []);

  // Smooth slide navigation functions
  const nextSlide = () => {
    if (isTransitioning || banners.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentSlide((prevSlide) => 
      prevSlide === banners.length - 1 ? 0 : prevSlide + 1
    );
    
    setTimeout(() => setIsTransitioning(false), 600); // Match CSS transition duration
  };

  const prevSlide = () => {
    if (isTransitioning || banners.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? banners.length - 1 : prevSlide - 1
    );
    
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide || banners.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    setTimeout(() => setIsTransitioning(false), 600);
  };

  useEffect(() => {
    // Fetch banners from backend
    const fetchBanners = async () => {
      setBannersLoading(true);
      try {
        const res = await fetch('/api/banners');
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setBanners(json.data);
        } else {
          setBanners(mockBanners); // Use mock banners as fallback
        }
      } catch (e) {
        setBanners(mockBanners); // Use mock banners on error
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto scroll functionality with smooth transitions
  useEffect(() => {
    if (isAutoPlaying && banners.length > 1 && !isTransitioning) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 4000); // Change slide every 4 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, banners.length, isTransitioning, nextSlide]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setIsDragging(false);
    setTouchStart(0);
    setTouchEnd(0);
    
    // Resume auto-play after a delay
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouchStart(e.clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setIsDragging(false);
    setTouchStart(0);
    setTouchEnd(0);
    
    // Resume auto-play after a delay
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    // Reset auto play timer when user manually changes slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) =>
        prevSlide === banners.length - 1 ? 0 : prevSlide + 1
        );
      }, 4000);
    }
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };


  const categoryCards = [
  {
    name: 'Chicken Pickles',
    icon: <picture className="w-8 h-8" />,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOwl1esg_izTyAaUnvffQsbU1OyDAKATsdQQ&sp',
    description: 'Spicy and flavorful chicken pickles'
  },
  {
    name: 'Mutton Pickles',
    icon: <picture className="w-8 h-8" />,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf1cath5TicXh0LxvsFom6LI05oD3digYWiw&s',
    description: 'Rich and tender mutton pickles'
  },
  {
    name: 'Veg Pickles',
    icon: <picture className="w-8 h-8" />,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFUFhvtuwCWtbZfPeXQsjkWUiagI7c7pa2ug&s',
    description: 'Fresh vegetable pickles with authentic spices'
  },
  {
    name: 'Gongura Pickles',
    icon: <picture className="w-8 h-8" />,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR1n1sqCpsDLlMOG1CVnvKjP2ujiBYOtANeA&s',
    description: 'Traditional gongura and sorrel leaf pickles'
  }];





  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Banner Carousel */}
      <section className='relative px-2 sm:px-4 lg:px-6'>
        <div
          className='w-full relative'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>

          <div 
            className='relative h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl mx-auto max-w-7xl'
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div
              className={`flex h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isTransitioning ? 'pointer-events-none' : ''
              }`}
              style={{ 
                transform: `translateX(-${currentSlide * 100}%)`,
                willChange: 'transform'
              }}
            >
              {banners.map((banner, index) => (
                <div 
                  key={banner.id} 
                  className={`w-full h-full flex-shrink-0 relative transition-opacity duration-700 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-90'
                  }`}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className='w-full h-full object-cover transition-transform duration-700 hover:scale-105'
                    draggable={false}
                  />
                  <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center'>
                    <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-white w-full'>
                      <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl transition-all duration-1000 delay-300 ${
                        index === currentSlide 
                          ? 'translate-x-0 opacity-100' 
                          : 'translate-x-8 opacity-0'
                      }`}>
                        <h1 className='text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-1 sm:mb-2 md:mb-4 leading-tight drop-shadow-lg'>
                          {banner.title}
                        </h1>
                        <h2 className='text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-1 sm:mb-2 md:mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-md'>
                          {banner.subtitle}
                        </h2>
                        <p className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-gray-200 leading-relaxed drop-shadow-sm'>
                          {banner.description}
                        </p>
                        <Button 
                          size='sm' 
                          asChild 
                          className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm md:text-base lg:text-lg px-4 py-2 sm:px-6 sm:py-3 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl rounded-full'
                        >
                          <Link to={banner.link} className="group">
                            {banner.cta}
                            <ArrowRight className='ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1' />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className='absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 z-10 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm'
            >
              <svg className='w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className='absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-300 z-10 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm'
            >
              <svg className='w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
            
            {/* Slide indicators */}
            <div className='absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3'>
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={`transition-all duration-300 rounded-full backdrop-blur-sm ${
                    index === currentSlide
                      ? 'w-6 sm:w-8 h-2 sm:h-3 bg-white shadow-lg'
                      : 'w-2 sm:w-3 h-2 sm:h-3 bg-white/60 hover:bg-white/80 hover:scale-125'
                  } disabled:cursor-not-allowed`}
                />
              ))}
            </div>
            
            {/* Auto-play indicator */}
            <div className='absolute top-2 sm:top-4 right-2 sm:right-4 z-10'>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className='bg-gradient-to-r from-black/60 to-black/40 hover:from-black/80 hover:to-black/60 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm'
                title={isAutoPlaying ? 'Pause auto-scroll' : 'Resume auto-scroll'}
              >
                {isAutoPlaying ? (
                  <svg className='w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
                  </svg>
                ) : (
                  <svg className='w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M8 5v14l11-7z' />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className='py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30'>
        <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
          <div className='text-center mb-8 sm:mb-12'>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4'>
              Shop by Category
            </h2>
            <p className='text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
              Explore our carefully curated categories to find exactly what you're looking for.
            </p>
          </div>
          
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
            {categoryCards.map((category, index) =>
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className='group transform hover:scale-105 transition-all duration-300'>

                <Card className='h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm'>
                  <div className='relative h-32 sm:h-40 lg:h-48 overflow-hidden'>
                    <img
                    src={category.image}
                    alt={category.name}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' />

                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
                    <div className={`absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${
                      index === 0 ? 'from-red-400 to-orange-500' :
                      index === 1 ? 'from-green-400 to-blue-500' :
                      index === 2 ? 'from-purple-400 to-pink-500' :
                      'from-yellow-400 to-red-500'
                    } flex items-center justify-center text-white font-bold text-xs sm:text-sm animate-pulse`}>
                      {category.name.charAt(0)}
                    </div>
                    <div className='absolute bottom-2 left-2 text-white'>
                      {category.icon}
                    </div>
                  </div>
                  <CardContent className='p-3 sm:p-4 lg:p-6'>
                    <h3 className='text-sm sm:text-base lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-1'>
                      {category.name}
                    </h3>
                    <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed'>
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </section>
    
 

      {/* Top Rated Products */}
      <section className='py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-yellow-50/50 via-orange-50/30 to-red-50/50'>
        <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
          <div className='text-center mb-8 sm:mb-12'>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center'>
              <Star className='w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-400 mr-2 sm:mr-3 fill-current animate-pulse' />
              <span className='bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent'>
                Top Rated Products
              </span>
            </h2>
            <p className='text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
              See what our customers love most - products with the highest ratings and reviews.
            </p>
          </div>
          
          <div className='relative'>
            <Carousel className='w-full'>
              <CarouselContent className='-ml-1 sm:-ml-2'>
                {topRatedProducts.map((product) =>
                <CarouselItem key={product.id} className='pl-1 sm:pl-2 basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'>
                    <div className="p-1 sm:p-2">
                      <div className='transform hover:scale-105 transition-transform duration-300'>
                        <ProductCard product={product} />
                      </div>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className='bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 shadow-lg' />
                <CarouselNext className='bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border-0 shadow-lg' />
              </div>
            </Carousel>
          </div>
          
          <div className='text-center mt-6 sm:mt-8'>
            <Button size='sm' asChild className='bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-2 sm:py-3 rounded-full'>
              <Link to='/products' className="group">
                View All Products
                <ArrowRight className='ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
          </div>
        </div>
      </section>



      {/* Featured Products */}
      <section className='py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50'>
        <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
          <div className='text-center mb-8 sm:mb-12'>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4'>
              Featured Products
            </h2>
            <p className='text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed'>
              Discover our handpicked selection of premium products at amazing prices.
            </p>
          </div>
          
          <div className='relative'>
            <Carousel className='w-full'>
              <CarouselContent className='-ml-1 sm:-ml-2'>
                {featuredProducts.map((product) =>
                <CarouselItem key={product.id} className='pl-1 sm:pl-2 basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'>
                    <div className="p-1 sm:p-2">
                      <div className='transform hover:scale-105 transition-transform duration-300'>
                        <ProductCard product={product} />
                      </div>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className='bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white border-0 shadow-lg' />
                <CarouselNext className='bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white border-0 shadow-lg' />
              </div>
            </Carousel>
          </div>
          
          <div className='text-center mt-6 sm:mt-8'>
            <Button size='sm' asChild className='bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-2 sm:py-3 rounded-full'>
              <Link to='/products' className="group">
                View All Products
                <ArrowRight className='ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service Features Section */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center group'>
              <div className='flex justify-center mb-6'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300'>
                  <Truck className='w-8 h-8 text-blue-600' />
                </div>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Free Shipping
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Free shipping on orders over $99
              </p>
            </div>

            <div className='text-center group'>
              <div className='flex justify-center mb-6'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300'>
                  <Shield className='w-8 h-8 text-green-600' />
                </div>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Secure Payment
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                100% secure payment processing
              </p>
            </div>

            <div className='text-center group'>
              <div className='flex justify-center mb-6'>
                <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300'>
                  <Headphones className='w-8 h-8 text-purple-600' />
                </div>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                24/7 Support
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                Round-the-clock customer support
              </p>
            </div>

            <div className='text-center group'>
              <div className='flex justify-center mb-6'>
                <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-300'>
                  <svg className='w-8 h-8 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                  </svg>
                </div>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Easy Returns
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                30-day hassle-free returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className='py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold mb-4'>
            Stay Updated with Our Latest Offers
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Subscribe to our newsletter and never miss out on exclusive deals and new product launches.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto'>
            <input
              type="email"
              placeholder="Enter your email"
              className='flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white' />

            <Button className='bg-white text-blue-600 hover:bg-gray-100 px-8'>
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold mb-4'>
            Ready to Start Shopping?
          </h2>
          <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
            Join thousands of satisfied customers and discover why we are the preferred choice for online shopping.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button size='lg' asChild className='bg-blue-600 hover:bg-blue-700'>
              <Link to='/auth'>
                Create Account
                <ArrowRight className='ml-2 w-5 h-5' />
              </Link>
            </Button>
            <Button size='lg' variant='outline' asChild className='border-gray-300 text-gray-300 hover:bg-gray-300 hover:text-gray-900'>
              <Link to='/products'>
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>);

};

export default HomePage;
