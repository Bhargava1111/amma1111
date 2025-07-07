import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
        localStorage.removeItem('ecommerce_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
        item.id === product.id ?
        { ...item, quantity: item.quantity + 1 } :
        item
        );
      } else {
        return [...currentItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((currentItems) =>
    currentItems.map((item) =>
    item.id === id ? { ...item, quantity } : item
    )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getTotalPrice = () => totalPrice;

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>);

};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
