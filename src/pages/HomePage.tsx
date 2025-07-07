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

const HomePage: React.FC = () => {
console.log('HomePage component rendered');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    // Fetch banners from backend
    const fetchBanners = async () => {
      setBannersLoading(true);
      try {
        const res = await fetch('/api/banners');
        const json = await res.json();
        if (json.success) setBanners(json.data);
        else setBanners([]);
      } catch (e) {
        setBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto scroll functionality
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) =>
        prevSlide === banners.length - 1 ? 0 : prevSlide + 1
        );
      }, 2500); // Change slide every 4 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, banners.length]);

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
    <div className='min-h-screen bg-gray-50'>
      {/* Banner Carousel */}
      <section className='relative'>
        <div
          className='w-full relative'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>

          <div className='relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden'>
            <div
              className='flex transition-transform duration-500 ease-in-out h-full'
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}>

              {banners.map((banner) =>
              <div key={banner.id} className='w-full h-full flex-shrink-0 relative'>
                  <img
                  src={banner.image}
                  alt={banner.title}
                  className='w-full h-full object-cover' />

                  <div className='absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full'>
                      <div className='max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl'>
                        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 leading-tight'>
                          {banner.title}
                        </h1>
                        <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-4 text-blue-200'>
                          {banner.subtitle}
                        </h2>
                        <p className='text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8 text-gray-200 leading-relaxed'>
                          {banner.description}
                        </p>
                        <Button size='sm' asChild className='bg-blue-600 hover:bg-blue-700 text-sm sm:text-base lg:size-lg'>
                          <Link to={banner.link}>
                            {banner.cta}
                            <ArrowRight className='ml-2 w-4 h-4 sm:w-5 sm:h-5' />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation arrows */}
            <button
              onClick={() => handleSlideChange(currentSlide === 0 ? banners.length - 1 : currentSlide - 1)}
              className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-200 z-10'>

              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>
            <button
              onClick={() => handleSlideChange(currentSlide === banners.length - 1 ? 0 : currentSlide + 1)}
              className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-200 z-10'>

              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
            
            {/* Slide indicators */}
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
              {banners.map((_, index) =>
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ?
                'bg-white' :
                'bg-white/50 hover:bg-white/75'}`
                } />

              )}
            </div>
            
            {/* Auto-play indicator */}
            <div className='absolute top-4 right-4 z-10'>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className='bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200'
                title={isAutoPlaying ? 'Pause auto-scroll' : 'Resume auto-scroll'}>

                {isAutoPlaying ?
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
                  </svg> :

                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M8 5v14l11-7z' />
                  </svg>
                }
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Shop by Category
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Explore our carefully curated categories to find exactly what you're looking for.
            </p>
          </div>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {categoryCards.map((category) =>
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className='group'>

                <Card className='h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden'>
                  <div className='relative h-48 overflow-hidden'>
                    <img
                    src={category.image}
                    alt={category.name}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />

                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                    <div className='absolute bottom-4 left-4 text-white'>
                      {category.icon}
                    </div>
                  </div>
                  <CardContent className='p-6'>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                      {category.name}
                    </h3>
                    <p className='text-gray-600 text-sm'>
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
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center'>
              <Star className='w-8 h-8 text-yellow-400 mr-3 fill-current' />
              Top Rated Products
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              See what our customers love most - products with the highest ratings and reviews.
            </p>
          </div>
          
          <Carousel className='w-full'>
            <CarouselContent className='-ml-1'>
              {topRatedProducts.map((product) =>
              <CarouselItem key={product.id} className='pl-1 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'>
                  <div className="p-1">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
          
          <div className='text-center mt-8'>
            <Button size='lg' asChild>
              <Link to='/products'>
                View All Products
                <ArrowRight className='ml-2 w-5 h-5' />
              </Link>
            </Button>
          </div>
        </div>
      </section>



      {/* Featured Products */}
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Featured Products
            </h2>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Discover our handpicked selection of premium products at amazing prices.
            </p>
          </div>
          
          <Carousel className='w-full'>
            <CarouselContent className='-ml-1'>
              {featuredProducts.map((product) =>
              <CarouselItem key={product.id} className='pl-1 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'>
                  <div className="p-1">
                    <ProductCard product={product} />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
          
          <div className='text-center mt-8'>
            <Button size='lg' asChild>
              <Link to='/products'>
                View All Products
                <ArrowRight className='ml-2 w-5 h-5' />
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
