// SEO utility functions for generating meta tags and structured data

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  image?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  tags: string[];
}

// Generate SEO-friendly URLs
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Generate breadcrumb data
export const generateBreadcrumbs = (path: string, productName?: string, categoryName?: string) => {
  const breadcrumbs = [
    { name: 'Home', url: '/' }
  ];

  const pathSegments = path.split('/').filter(segment => segment);

  pathSegments.forEach((segment, index) => {
    const url = '/' + pathSegments.slice(0, index + 1).join('/');
    
    switch (segment) {
      case 'products':
        breadcrumbs.push({ name: 'Products', url });
        break;
      case 'product':
        if (productName) {
          breadcrumbs.push({ name: productName, url });
        }
        break;
      case 'category':
        if (categoryName) {
          breadcrumbs.push({ name: categoryName, url });
        }
        break;
      case 'blog':
        breadcrumbs.push({ name: 'Blog', url });
        break;
      case 'contact':
        breadcrumbs.push({ name: 'Contact', url });
        break;
      case 'about':
        breadcrumbs.push({ name: 'About', url });
        break;
      default:
        breadcrumbs.push({ 
          name: segment.charAt(0).toUpperCase() + segment.slice(1), 
          url 
        });
    }
  });

  return breadcrumbs;
};

// Generate product keywords
export const generateProductKeywords = (product: Product): string => {
  const keywords = [
    product.name.toLowerCase(),
    product.category.toLowerCase(),
    'food products',
    'online grocery',
    'premium food'
  ];

  if (product.brand) {
    keywords.push(product.brand.toLowerCase());
  }

  // Add descriptive keywords based on product name
  const productWords = product.name.toLowerCase().split(' ');
  keywords.push(...productWords);

  // Add category-specific keywords
  const categoryKeywords = getCategoryKeywords(product.category);
  keywords.push(...categoryKeywords);

  return [...new Set(keywords)].join(', ');
};

// Get category-specific keywords
export const getCategoryKeywords = (category: string): string[] => {
  const keywordMap: Record<string, string[]> = {
    'fruits': ['fresh fruits', 'organic fruits', 'seasonal fruits', 'healthy snacks'],
    'vegetables': ['fresh vegetables', 'organic vegetables', 'farm fresh', 'healthy eating'],
    'dairy': ['dairy products', 'milk products', 'cheese', 'organic dairy'],
    'meat': ['fresh meat', 'premium meat', 'protein', 'butcher quality'],
    'seafood': ['fresh seafood', 'fish', 'shellfish', 'ocean fresh'],
    'bakery': ['fresh bread', 'baked goods', 'artisan bread', 'pastries'],
    'beverages': ['drinks', 'beverages', 'refreshing drinks', 'healthy drinks'],
    'snacks': ['healthy snacks', 'gourmet snacks', 'premium snacks', 'quick bites'],
    'spices': ['cooking spices', 'herbs', 'seasonings', 'flavor enhancers'],
    'grains': ['whole grains', 'cereals', 'healthy grains', 'nutrition']
  };

  return keywordMap[category.toLowerCase()] || ['food products', 'gourmet food'];
};

// Generate Open Graph image URL
export const generateOGImage = (
  title: string, 
  type: 'product' | 'category' | 'article' | 'default' = 'default',
  imageUrl?: string
): string => {
  if (imageUrl && imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If we have a local image, return full URL
  if (imageUrl) {
    return `${window.location.origin}${imageUrl}`;
  }

  // Generate dynamic OG image URL (you can implement a service for this)
  const encodedTitle = encodeURIComponent(title);
  return `${window.location.origin}/api/og?title=${encodedTitle}&type=${type}`;
};

// Generate FAQ structured data
export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Generate local business structured data
export const generateLocalBusinessStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "MANAfoods",
    "description": "Premium quality food products and online grocery delivery service",
    "url": window.location.origin,
    "telephone": "+1-555-MANA-FOOD",
    "email": "info@manafoods.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Food Street",
      "addressLocality": "Food City",
      "addressRegion": "FC",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-16:00"
    ],
    "priceRange": "$$",
    "servesCuisine": "International",
    "acceptsReservations": false
  };
};

// Generate review structured data
export const generateReviewStructuredData = (reviews: Array<{
  author: string;
  rating: number;
  comment: string;
  date: string;
}>) => {
  return reviews.map(review => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": 5
    },
    "reviewBody": review.comment,
    "datePublished": review.date
  }));
};

// Validate and clean meta description
export const cleanMetaDescription = (description: string, maxLength = 160): string => {
  // Remove HTML tags
  const cleanText = description.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  const trimmed = cleanText.trim();
  
  // Truncate if too long
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  // Find last complete sentence or word within limit
  const truncated = trimmed.substring(0, maxLength - 3);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSentence > maxLength * 0.7) {
    return trimmed.substring(0, lastSentence + 1);
  } else if (lastSpace > maxLength * 0.8) {
    return trimmed.substring(0, lastSpace) + '...';
  } else {
    return truncated + '...';
  }
};

// Additional SEO utility functions
export const generateProductSEOTitle = (productName: string, category?: string) => {
  const baseTitle = `${productName} - Premium Quality`;
  return category ? `${baseTitle} ${category} | MANAfoods` : `${baseTitle} | MANAfoods`;
};

export const generateCategorySEOTitle = (categoryName: string) => {
  return `${categoryName} - Premium Food Products | MANAfoods`;
};

export const generateBlogSEOTitle = (articleTitle: string) => {
  return `${articleTitle} - Food Blog | MANAfoods`;
};

export const generateCategoryDescription = (categoryName: string, productCount?: number) => {
  const baseDesc = `Discover premium ${categoryName.toLowerCase()} products at MANAfoods.`;
  const countText = productCount ? ` Browse ${productCount}+ quality items.` : '';
  const cta = ' Fresh ingredients, organic options, and gourmet selections with fast delivery.';
  
  return cleanMetaDescription(baseDesc + countText + cta);
};