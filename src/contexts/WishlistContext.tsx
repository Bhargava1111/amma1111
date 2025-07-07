import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_date: string;
}

interface WishlistContextType {
  wishlistItems: string[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loadWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_TABLE_ID = '10399';

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(WISHLIST_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [
        {
          name: 'user_id',
          op: 'Equal',
          value: user.ID
        }]

      });

      if (error) {
        console.error('Error loading wishlist:', error);
        toast({
          title: "Error",
          description: "Failed to load wishlist",
          variant: "destructive"
        });
        return;
      }

      if (Array.isArray(data?.List)) {
        const productIds = data.List.map((item: WishlistItem) => item.product_id);
        setWishlistItems(productIds);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error in loadWishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }

    if (wishlistItems.includes(productId)) {
      toast({
        title: "Already in Wishlist",
        description: "This item is already in your wishlist"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await window.ezsite.apis.tableCreate(WISHLIST_TABLE_ID, {
        user_id: user.ID,
        product_id: productId,
        added_date: new Date().toISOString()
      });

      if (error) {
        throw new Error(error);
      }

      setWishlistItems((prev) => [...prev, productId]);
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist"
      });

      // Send notification to user
      try {
        await window.ezsite.apis.tableCreate('10412', {
          user_id: user.ID,
          title: 'Item Added to Wishlist',
          message: 'An item has been added to your wishlist',
          type: 'system',
          channel: 'in_app',
          status: 'sent',
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString()
        });
      } catch (notifError) {
        console.error('Error creating wishlist notification:', notifError);
      }

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // First, find the wishlist item
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(WISHLIST_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        {
          name: 'user_id',
          op: 'Equal',
          value: user.ID
        },
        {
          name: 'product_id',
          op: 'Equal',
          value: productId
        }]

      });

      if (fetchError) {
        throw new Error(fetchError);
      }

      if (data?.List && data.List.length > 0) {
        const wishlistItem = data.List[0];

        const { error: deleteError } = await window.ezsite.apis.tableDelete(WISHLIST_TABLE_ID, wishlistItem.id);

        if (deleteError) {
          throw new Error(deleteError);
        }

        setWishlistItems((prev) => prev.filter((id) => id !== productId));
        toast({
          title: "Removed from Wishlist",
          description: "Item has been removed from your wishlist"
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item from wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get all wishlist items for the user
      const { data, error: fetchError } = await window.ezsite.apis.tablePage(WISHLIST_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        Filters: [
        {
          name: 'user_id',
          op: 'Equal',
          value: user.ID
        }]

      });

      if (fetchError) {
        throw new Error(fetchError);
      }

      if (data?.List && data.List.length > 0) {
        // Delete each item
        for (const item of data.List) {
          const { error: deleteError } = await window.ezsite.apis.tableDelete(WISHLIST_TABLE_ID, item.id);
          if (deleteError) {
            console.error('Error deleting wishlist item:', deleteError);
          }
        }
      }

      setWishlistItems([]);
      toast({
        title: "Wishlist Cleared",
        description: "All items have been removed from your wishlist"
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>);

};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
