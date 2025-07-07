import { Product } from '../types';
import { ProductService } from '../services/ProductService';

// Food categories for MANAfoods
export const categories = [
'All',
'Veg Pickles',
'Non Veg Pickles',
'Spicy Pickles',
'Sweet Pickles',
'Gongura Pickles',
'Chicken Pickles',
'Mutton Pickles',
'Fish Pickles',
'Mixed Pickles',
'Seasonal Pickles'];


// Mock products function that uses ProductService
export const mockProducts = (): Product[] => {
  // Return synchronous fallback data for compatibility
  return getFallbackProducts();
};

// Async function for fetching real products
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const result = await ProductService.getProducts({ pageSize: 100 });
    return result.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return fallback mock data if API fails
    return getFallbackProducts();
  }
};

// Fallback mock data for development/testing
function getFallbackProducts(): Product[] {
  return [
  {
    id: '1',
    name: 'Veg Pickle Tomato Pickle',
    description: 'Premium quality homemade tomato pickle made with fresh tomatoes and traditional spices. Perfect accompaniment to any meal.',
    price: 199.00,
    image: 'https://images.unsplash.com/photo-1600626336264-60ef2a55bd33?w=500&h=500&fit=crop',
    category: 'Veg Pickles',
    stock_quantity: 100,
    rating: 4.8,
    reviews: 124,
    features: ['Homemade Quality', 'Fresh Tomatoes', 'Traditional Spices', 'No Preservatives'],
    variants: [
      { weight: '250 Grams', price: 199.00, stock: 50 },
      { weight: '500 Grams', price: 349.00, stock: 30 },
      { weight: '750 Grams', price: 499.00, stock: 20 },
      { weight: '1000 Grams', price: 649.00, stock: 10 }
    ],
    is_active: true
  },
  {
    id: '2',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock_quantity: 50,
    rating: 4.5,
    reviews: 89,
    features: ['Noise Cancellation', '30-hour Battery', 'Bluetooth 5.0', 'Quick Charge'],
    is_active: true
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and smartphone integration.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock_quantity: 30,
    rating: 4.7,
    reviews: 156,
    features: ['Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', 'Sleep Tracking'],
    is_active: true
  },
  {
    id: '4',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt available in multiple colors.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    category: 'Clothing',
    stock_quantity: 100,
    rating: 4.3,
    reviews: 73,
    features: ['100% Organic Cotton', 'Pre-shrunk', 'Machine Washable', 'Eco-friendly'],
    is_active: true
  },
  {
    id: '5',
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 elegant ceramic coffee mugs perfect for your morning routine.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop',
    category: 'Home & Garden',
    stock_quantity: 75,
    rating: 4.6,
    reviews: 45,
    features: ['Set of 4', 'Dishwasher Safe', 'Microwave Safe', 'Premium Ceramic'],
    is_active: true
  },
  {
    id: '6',
    name: 'Yoga Mat Pro',
    description: 'Non-slip yoga mat with extra cushioning for comfort during your practice.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
    category: 'Sports & Outdoors',
    stock_quantity: 40,
    rating: 4.4,
    reviews: 92,
    features: ['Non-slip Surface', 'Extra Thick', 'Carrying Strap', 'Eco-friendly Material'],
    is_active: true
  },
  {
    id: '7',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with multiple brightness levels and USB charging port.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock_quantity: 60,
    rating: 4.2,
    reviews: 67,
    features: ['Adjustable Brightness', 'USB Charging Port', 'Touch Control', 'Energy Efficient'],
    is_active: true
  },
  {
    id: '8',
    name: 'Leather Crossbody Bag',
    description: 'Stylish genuine leather crossbody bag perfect for everyday use.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    category: 'Clothing',
    stock_quantity: 25,
    rating: 4.7,
    reviews: 34,
    features: ['Genuine Leather', 'Adjustable Strap', 'Multiple Compartments', 'Handcrafted'],
    is_active: true
  },
  {
    id: '9',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    category: 'Sports & Outdoors',
    stock_quantity: 80,
    rating: 4.5,
    reviews: 128,
    features: ['Double Wall Insulation', '24-hour Cold', 'BPA Free', 'Leak Proof'],
    is_active: true
  },
  // Add more products with variants
  {
    id: '13',
    name: 'Veg Pickle Gongura Chilli Pickle',
    description: 'Authentic gongura chilli pickle made with traditional recipes and fresh ingredients.',
    price: 199.00,
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxBJTIwamFyJTIwb2YlMjBzcGljeSUyMGNoaWxsaSUyMHBpY2tsZSUyMHdpdGglMjBmcmVzaCUyMGluZ3JlZGllbnRzJTIwYW5kJTIwdHJhZGl0aW9uYWwlMjBzcGljZXMufGVufDB8fHx8MTc0ODc0OTE0MXww&ixlib=rb-4.1.0&q=80&w=200$w=500',
    category: 'Spicy Pickles',
    stock_quantity: 80,
    rating: 4.7,
    reviews: 98,
    features: ['Authentic Recipe', 'Spicy Flavor', 'Fresh Ingredients', 'No Preservatives'],
    variants: [
      { weight: '250 Grams', price: 199.00, stock: 40 },
      { weight: '500 Grams', price: 349.00, stock: 25 },
      { weight: '750 Grams', price: 499.00, stock: 15 },
      { weight: '1000 Grams', price: 649.00, stock: 5 }
    ],
    is_active: true
  },
  {
    id: '14',
    name: 'Non Veg Pickle Gongura Chicken Boneless Pickle',
    description: 'Delicious gongura chicken boneless pickle with authentic spices and tender chicken pieces.',
    price: 429.00,
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxBJTIwamFyJTIwb2YlMjBzcGljeSUyMGNoaWNrZW4lMjBwaWNrbGUlMjB3aXRoJTIwZnJlc2glMjBpbmdyZWRpZW50cyUyMGFuZCUyMHRyYWRpdGlvbmFsJTIwc3BpY2VzLnxlbnwwfHx8fDE3NDg3NDkxNDF8MA&ixlib=rb-4.1.0&q=80&w=200$w=500',
    category: 'Chicken Pickles',
    stock_quantity: 60,
    rating: 4.9,
    reviews: 112,
    features: ['Boneless Chicken', 'Authentic Spices', 'Rich Flavor', 'No Preservatives'],
    variants: [
      { weight: '250 Grams', price: 429.00, stock: 30 },
      { weight: '500 Grams', price: 799.00, stock: 20 },
      { weight: '750 Grams', price: 1149.00, stock: 10 },
      { weight: '1000 Grams', price: 1499.00, stock: 5 }
    ],
    is_active: true
  },
  {
    id: '15',
    name: 'Veg Pickle Gongura Pickle',
    description: 'Traditional gongura pickle made with fresh sorrel leaves and authentic spices.',
    price: 199.00,
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxBJTIwamFyJTIwb2YlMjBnb25ndXJhJTIwcGlja2xlJTIwd2l0aCUyMGZyZXNoJTIwaW5ncmVkaWVudHMlMjBhbmQlMjB0cmFkaXRpb25hbCUyMHNwaWNlcy58ZW58MHx8fHwxNzQ4NzQ5MTQxfDA&ixlib=rb-4.1.0&q=80&w=200$w=500',
    category: 'Gongura Pickles',
    stock_quantity: 90,
    rating: 4.6,
    reviews: 87,
    features: ['Authentic Recipe', 'Tangy Flavor', 'Fresh Sorrel Leaves', 'No Preservatives'],
    variants: [
      { weight: '250 Grams', price: 199.00, stock: 45 },
      { weight: '500 Grams', price: 349.00, stock: 30 },
      { weight: '750 Grams', price: 499.00, stock: 15 },
      { weight: '1000 Grams', price: 649.00, stock: 8 }
    ],
    is_active: true
  },
  {
    id: '16',
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 elegant ceramic coffee mugs perfect for your morning routine.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxBJTIwc2V0JTIwb2YlMjBmb3VyJTIwZWxlZ2FudCUyMGNlcmFtaWMlMjBjb2ZmZWUlMjBtdWdzJTJDJTIwcGVyZmVjdCUyMGZvciUyMGVuam95aW5nJTIweW91ciUyMG1vcm5pbmclMjBjb2ZmZWUufGVufDB8fHx8MTc0ODc0OTE0MHww&ixlib=rb-4.1.0&q=80&w=200$w=500',
    category: 'Home & Garden',
    stock_quantity: 75,
    rating: 4.6,
    reviews: 45,
    features: ['Set of 4', 'Dishwasher Safe', 'Microwave Safe', 'Premium Ceramic'],
    is_active: true
  },
  {
    id: '17',
    name: 'Yoga Mat Pro',
    description: 'Non-slip yoga mat with extra cushioning for comfort during your practice.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
    category: 'Sports & Outdoors',
    stock_quantity: 40,
    rating: 4.4,
    reviews: 92,
    features: ['Non-slip Surface', 'Extra Thick', 'Carrying Strap', 'Eco-friendly Material'],
    is_active: true
  },
  {
    id: '10',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with multiple brightness levels and USB charging port.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock_quantity: 60,
    rating: 4.2,
    reviews: 67,
    features: ['Adjustable Brightness', 'USB Charging Port', 'Touch Control', 'Energy Efficient'],
    is_active: true
  },
  {
    id: '11',
    name: 'Leather Crossbody Bag',
    description: 'Stylish genuine leather crossbody bag perfect for everyday use.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    category: 'Clothing',
    stock_quantity: 25,
    rating: 4.7,
    reviews: 34,
    features: ['Genuine Leather', 'Adjustable Strap', 'Multiple Compartments', 'Handcrafted'],
    is_active: true
  },
  {
    id: '12',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    category: 'Sports & Outdoors',
    stock_quantity: 80,
    rating: 4.5,
    reviews: 128,
    features: ['Double Wall Insulation', '24-hour Cold', 'BPA Free', 'Leak Proof'],
    is_active: true
  }];
}

// Helper functions for product operations
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await ProductService.getProductById(id);
  } catch (error) {
    console.error('Error getting product by ID:', error);
    const fallbackProducts = getFallbackProducts();
    return fallbackProducts.find((p) => p.id === id) || null;
  }
};

export const getProductsByCategory = async (category: string, limit?: number): Promise<Product[]> => {
  try {
    return await ProductService.getProductsByCategory(category, limit);
  } catch (error) {
    console.error('Error getting products by category:', error);
    const fallbackProducts = getFallbackProducts();
    const filtered = fallbackProducts.filter((p) => p.category === category);
    return limit ? filtered.slice(0, limit) : filtered;
  }
};

export const getFeaturedProducts = async (limit?: number): Promise<Product[]> => {
  try {
    return await ProductService.getFeaturedProducts(limit);
  } catch (error) {
    console.error('Error getting featured products:', error);
    const fallbackProducts = getFallbackProducts();
    return limit ? fallbackProducts.slice(0, limit) : fallbackProducts;
  }
};

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const result = await ProductService.getProducts({
      searchTerm,
      pageSize: 100
    });
    return result.products;
  } catch (error) {
    console.error('Error searching products:', error);
    const fallbackProducts = getFallbackProducts();
    return fallbackProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const categories = await ProductService.getCategories();
    return categories as string[];
  } catch (error) {
    console.error('Error getting categories:', error);
    return categories;
  }
};
