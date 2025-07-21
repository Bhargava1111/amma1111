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


// Remove mockProducts and getFallbackProducts
// Only use backend fetches in all functions

export const fetchProducts = async (): Promise<Product[]> => {
  const result = await ProductService.getProducts({ pageSize: 100 });
  return result.products;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    let prod = await ProductService.getProductById(id);
    if (!prod && !isNaN(Number(id))) {
      prod = await ProductService.getProductById(String(Number(id)));
    }
    if (prod) return prod;
  } catch (error) {
    console.error('Error getting product by ID:', error);
  }
  return null;
};

export const getProductsByCategory = async (category: string, limit?: number): Promise<Product[]> => {
  return await ProductService.getProductsByCategory(category, limit);
};

export const getFeaturedProducts = async (limit?: number): Promise<Product[]> => {
  return await ProductService.getFeaturedProducts(limit);
};

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  const result = await ProductService.getProducts({
    searchTerm,
    pageSize: 100
  });
  return result.products;
};

export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const categories = await ProductService.getCategories();
    return categories as string[];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};
