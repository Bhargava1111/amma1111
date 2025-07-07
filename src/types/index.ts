export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categories?: string[];
  stock_quantity: number;
  rating?: number;
  reviews?: number;
  features?: string[];
  variants?: ProductVariant[];
  is_active: boolean;
  image_url?: string;
  image_urls?: string[];
  brand?: string;
  tags?: string[];
  expiry_date?: string;
  barcode?: string;
}

export interface ProductVariant {
  weight?: string;
  price: number;
  stock: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
  paymentMethod: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}
