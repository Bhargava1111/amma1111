import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductCard from '../components/ProductCard';
import ProductSearch from '../components/ProductSearch';
import { fetchProducts } from '../data/products';
import SEOHead from '../components/SEO/SEOHead';
import StructuredData from '../components/SEO/StructuredData';
import { generateCategorySEOTitle, generateCategoryDescription, generateBreadcrumbs } from '../utils/seoUtils';
import { Search, Grid, List, Filter, SlidersHorizontal } from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  minRating: number;
  sortBy: string;
  inStock: boolean;
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    priceRange: [0, 2000],
    minRating: 0,
    sortBy: 'name',
    inStock: false
  });

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      const matchesSearch = !searchFilters.query ||
      product.name.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      product.description.toLowerCase().includes(searchFilters.query.toLowerCase());

      const matchesCategory = searchFilters.category === 'All' || product.category === searchFilters.category;

      const matchesPrice = product.price >= searchFilters.priceRange[0] &&
      product.price <= searchFilters.priceRange[1];

      const matchesRating = (product.rating || 0) >= searchFilters.minRating;

      const matchesStock = !searchFilters.inStock || (product.stock_quantity || 0) > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (searchFilters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [allProducts, searchFilters]);

  const handleFiltersChange = (filters: SearchFilters) => {
    setSearchFilters(filters);

    // Update URL parameters
    const params = new URLSearchParams();
    if (filters.query) params.set('search', filters.query);
    if (filters.category !== 'All') params.set('category', filters.category);
    setSearchParams(params);
  };

  // Generate SEO data based on current filters
  const currentCategory = searchFilters.category !== 'All' ? searchFilters.category : null;
  const searchQuery = searchFilters.query;
  
  const seoTitle = currentCategory 
    ? generateCategorySEOTitle(currentCategory)
    : searchQuery 
      ? `Search Results for "${searchQuery}" | MANAfoods`
      : 'Premium Food Products - Shop Online | MANAfoods';
      
  const seoDescription = currentCategory
    ? generateCategoryDescription(currentCategory, filteredAndSortedProducts.length)
    : searchQuery
      ? `Found ${filteredAndSortedProducts.length} products for "${searchQuery}". Shop premium food products at MANAfoods with fast delivery and best prices.`
      : 'Shop premium food products at MANAfoods. Browse our complete collection of chicken pickles, mutton pickles, veg pickles, gongura pickles and more. Fast delivery, best prices.';

  const breadcrumbs = generateBreadcrumbs(window.location.pathname, undefined, currentCategory);

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={currentCategory ? `${currentCategory.toLowerCase()}, food products, premium ${currentCategory.toLowerCase()}, online grocery, MANAfoods` : 'food products, online grocery, premium food, pickles, gourmet food, MANAfoods'}
        type="website"
        canonicalUrl={window.location.href}
      />
      
      <StructuredData
        breadcrumb={{ items: breadcrumbs }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-4">
              Products
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our complete collection of amazing products
            </p>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <Filter className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className={`mb-6 sm:mb-8 transition-all duration-300 ${showFilters || window.innerWidth >= 1024 ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6">
            <ProductSearch
              onFiltersChange={handleFiltersChange}
              totalResults={filteredAndSortedProducts.length} />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
              <p className="text-xs sm:text-sm font-medium text-gray-700">
                <span className="text-blue-600 font-bold">{filteredAndSortedProducts.length}</span> of {allProducts.length} products
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-blue-100">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-full transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'hover:bg-blue-50 text-gray-600'
              }`}>
              <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-full transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'hover:bg-purple-50 text-gray-600'
              }`}>
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ?
        <div className="flex justify-center items-center py-12 sm:py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-600 absolute top-0"></div>
            </div>
          </div> :

        /* Products Grid */
        filteredAndSortedProducts.length > 0 ?
        <div className={`grid gap-2 sm:gap-3 lg:gap-6 transition-all duration-300 ${
        viewMode === 'grid' ?
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' :
        'grid-cols-1 max-w-4xl mx-auto'}`}>
            {filteredAndSortedProducts.map((product, index) =>
              <div 
                key={product.id} 
                className="h-full transform hover:scale-105 transition-all duration-300"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <ProductCard 
                  product={product} 
                />
              </div>
            )}
        </div> :

        <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm border-0 shadow-xl">
            <div className="text-gray-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-700">No products found</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
                Try adjusting your search criteria or browse our categories to discover amazing products.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchFilters({
                    query: '',
                    category: 'All',
                    priceRange: [0, 2000],
                    minRating: 0,
                    sortBy: 'name',
                    inStock: false
                  });
                  setSearchParams(new URLSearchParams());
                }}
                className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        }
      </div>
    </div>
    </>
  );

};

export default ProductsPage;
