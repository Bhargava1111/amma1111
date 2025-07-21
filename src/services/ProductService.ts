import { Product } from '../types';

const PRODUCTS_TABLE_ID = '10403';

export class ProductService {
  // Get all products with pagination and filtering
  static async getProducts(params: {
    pageNo?: number;
    pageSize?: number;
    category?: string;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        pageNo = 1,
        pageSize = 20,
        category,
        searchTerm,
        minPrice,
        maxPrice,
        sortBy = 'id',
        sortOrder = 'desc'
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNo.toString());
      queryParams.append('limit', pageSize.toString());
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);
      
      if (category && category !== '') {
        queryParams.append('category', category);
      }
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (minPrice !== undefined) {
        queryParams.append('minPrice', minPrice.toString());
      }
      
      if (maxPrice !== undefined) {
        queryParams.append('maxPrice', maxPrice.toString());
      }

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return {
        products: data.data,
        totalCount: data.total,
        currentPage: data.page,
        totalPages: data.totalPages,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get a single product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit: number = 8) {
    try {
      const response = await fetch(`/api/products?limit=${limit}&sortBy=id&sortOrder=desc`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string, limit: number = 12) {
    try {
      const response = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=${limit}&sortBy=id&sortOrder=desc`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Get available categories
  static async getCategories() {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Admin: Create new product
  static async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock_quantity: number;
    features?: string[];
    brand?: string;
    is_active?: boolean;
    tags?: string[];
    expiry_date?: string;
    barcode?: string;
    variants?: any[];
  }) {
    try {
      const product = {
        ...productData,
        features: productData.features || [],
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Admin: Update product
  static async updateProduct(productId: string, productData: Partial<{
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock_quantity: number;
    features: string[];
    is_active: boolean;
    brand: string;
    tags: string[];
    expiry_date: string;
    barcode: string;
    variants: any[];
  }>) {
    try {
      const updateData: any = {
        ...productData,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Admin: Delete product (soft delete by setting is_active to false)
  static async deleteProduct(productId: string) {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Update stock quantity
  static async updateStock(productId: string, quantity: number) {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_quantity: quantity,
          updated_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Check if product is in stock
  static async checkStock(productId: string, requestedQuantity: number = 1): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      return product ? product.stock_quantity >= requestedQuantity : false;
    } catch (error) {
      console.error('Error checking stock:', error);
      return false;
    }
  }
}
