import { ProductService } from './src/services/ProductService.ts';

const debugProducts = async () => {
  try {
    const result = await ProductService.getProducts({ pageSize: 10 }); // Fetch a small number of products for debugging
    console.log('Fetched Products:', JSON.stringify(result.products, null, 2));
  } catch (error) {
    console.error('Error in debugProducts:', error);
  }
};

debugProducts();
