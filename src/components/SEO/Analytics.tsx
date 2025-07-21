import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEO_CONFIG } from '../../config/seo';

// Google Analytics tracking functions
export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', SEO_CONFIG.analytics.googleAnalyticsId, {
      page_path: path,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPurchase = (transactionId: string, value: number, currency: string = 'INR', items: any[] = []) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }
  
  // Facebook Pixel purchase tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency
    });
  }
};

export const trackAddToCart = (itemId: string, itemName: string, category: string, value: number, currency: string = 'INR') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: currency,
      value: value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        category: category,
        quantity: 1,
        price: value
      }]
    });
  }
  
  // Facebook Pixel add to cart tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [itemId],
      content_name: itemName,
      content_category: category,
      value: value,
      currency: currency
    });
  }
};

export const trackViewItem = (itemId: string, itemName: string, category: string, value: number, currency: string = 'INR') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: currency,
      value: value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        category: category,
        price: value
      }]
    });
  }
  
  // Facebook Pixel view content tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [itemId],
      content_name: itemName,
      content_category: category,
      value: value,
      currency: currency
    });
  }
};

export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm
    });
  }
  
  // Facebook Pixel search tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchTerm
    });
  }
};

export const trackSignUp = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method
    });
  }
  
  // Facebook Pixel complete registration tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
};

export const trackLogin = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method
    });
  }
};

export const trackBeginCheckout = (value: number, currency: string = 'INR', items: any[] = []) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: currency,
      value: value,
      items: items
    });
  }
  
  // Facebook Pixel initiate checkout tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
      num_items: items.length
    });
  }
};

export const trackShare = (contentType: string, itemId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share', {
      content_type: contentType,
      item_id: itemId
    });
  }
};

// Custom hook for automatic page tracking
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
};

// Performance tracking
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          window.gtag('event', 'LCP', {
            event_category: 'Web Vitals',
            value: Math.round(entry.startTime),
            non_interaction: true,
          });
        }
        
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          window.gtag('event', 'FID', {
            event_category: 'Web Vitals',
            value: Math.round(fidEntry.processingStart - fidEntry.startTime),
            non_interaction: true,
          });
        }
        
        if (entry.entryType === 'layout-shift') {
          const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!clsEntry.hadRecentInput && clsEntry.value) {
            window.gtag('event', 'CLS', {
              event_category: 'Web Vitals',
              value: Math.round(clsEntry.value * 1000),
              non_interaction: true,
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }
};

// E-commerce tracking helpers
export const trackItemListView = (listName: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item_list', {
      item_list_name: listName,
      items: items
    });
  }
};

export const trackSelectItem = (itemId: string, itemName: string, listName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_item', {
      item_list_name: listName,
      items: [{
        item_id: itemId,
        item_name: itemName
      }]
    });
  }
};

// Declare global gtag and fbq functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}