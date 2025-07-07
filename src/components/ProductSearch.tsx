import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Star } from 'lucide-react';
import { categories } from '../data/products';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  minRating: number;
  sortBy: string;
  inStock: boolean;
}

interface ProductSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  totalResults: number;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onFiltersChange, totalResults }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'All',
    priceRange: [0, 2000],
    minRating: 0,
    sortBy: 'name',
    inStock: false
  });
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      category: 'All',
      priceRange: [0, 2000],
      minRating: 0,
      sortBy: 'name',
      inStock: false
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters =
  filters.query !== '' ||
  filters.category !== 'All' ||
  filters.priceRange[0] > 0 ||
  filters.priceRange[1] < 2000 ||
  filters.minRating > 0 ||
  filters.inStock;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10" />

        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2">

            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters &&
            <Badge variant="secondary" className="ml-1">
                Active
              </Badge>
            }
          </Button>
          
          {hasActiveFilters &&
          <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          }
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {totalResults} product{totalResults !== 1 ? 's' : ''} found
      </div>

      {/* Filters Panel */}
      {showFilters &&
      <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Category Filter */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Category</h4>
                <Select
                value={filters.category}
                onValueChange={(value) => updateFilters({ category: value })}>
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) =>
                  <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Price Range</h4>
                <div className="space-y-2">
                  <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  max={2000}
                  step={10}
                  className="w-full" />

                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Minimum Rating</h4>
                <div className="space-y-1 sm:space-y-2">
                  {[4, 3, 2, 1, 0].map((rating) =>
                <label key={rating} className="flex items-center space-x-2 cursor-pointer py-1">
                      <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => updateFilters({ minRating: rating })}
                    className="sr-only" />

                      <div className={`w-4 h-4 rounded-full border-2 ${filters.minRating === rating ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {filters.minRating === rating && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <div className="flex items-center space-x-1">
                        {rating > 0 ?
                    <>
                            {[...Array(rating)].map((_, i) =>
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      )}
                            <span className="text-xs sm:text-sm text-gray-600">& up</span>
                          </> :

                    <span className="text-xs sm:text-sm text-gray-600">All ratings</span>
                    }
                      </div>
                    </label>
                )}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => updateFilters({ inStock: checked as boolean })} />

                    <label htmlFor="inStock" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                      In stock only
                    </label>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Sort by</label>
                    <Select
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilters({ sortBy: value })}>
                      <SelectTrigger className="h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="name_desc">Name Z-A</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Active Filters Display */}
      {hasActiveFilters &&
      <div className="flex flex-wrap gap-1 sm:gap-2">
          {filters.query &&
        <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.query}"
              <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => updateFilters({ query: '' })} />

            </Badge>
        }
          
          {filters.category !== 'All' &&
        <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.category}
              <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => updateFilters({ category: 'All' })} />

            </Badge>
        }
          
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) &&
        <Badge variant="secondary" className="flex items-center gap-1">
              Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => updateFilters({ priceRange: [0, 2000] })} />

            </Badge>
        }
          
          {filters.minRating > 0 &&
        <Badge variant="secondary" className="flex items-center gap-1">
              {filters.minRating}+ stars
              <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => updateFilters({ minRating: 0 })} />

            </Badge>
        }
          
          {filters.inStock &&
        <Badge variant="secondary" className="flex items-center gap-1">
              In stock only
              <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => updateFilters({ inStock: false })} />

            </Badge>
        }
        </div>
      }
    </div>);

};

export default ProductSearch;
