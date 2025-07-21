// SEO Configuration for MANAfoods
export const SEO_CONFIG = {
  // Site Information
  siteName: 'MANAfoods',
  siteUrl: 'https://manafoods.com', // Replace with your actual domain
  defaultTitle: 'MANAfoods - Premium Quality Food Products Online',
  titleTemplate: '%s | MANAfoods',
  defaultDescription: 'Discover premium quality food products at MANAfoods. Fresh ingredients, organic options, and gourmet selections delivered to your door. Shop now for the best in food quality and taste.',
  
  // Default Keywords
  defaultKeywords: [
    'food products',
    'organic food',
    'gourmet food',
    'fresh ingredients',
    'online grocery',
    'premium food',
    'healthy eating',
    'food delivery',
    'traditional pickles',
    'chicken pickles',
    'mutton pickles',
    'veg pickles',
    'gongura pickles'
  ],

  // Social Media
  social: {
    twitter: '@manafoods',
    facebook: 'https://facebook.com/manafoods',
    instagram: 'https://instagram.com/manafoods',
    linkedin: 'https://linkedin.com/company/manafoods',
    youtube: 'https://youtube.com/@manafoods'
  },

  // Business Information
  business: {
    name: 'MANAfoods',
    legalName: 'MANAfoods Private Limited',
    foundingDate: '2024',
    email: 'support@manaeats.com',
    phone: '+91-98765-43210',
    address: {
      streetAddress: '123 Food Street',
      addressLocality: 'Food City',
      addressRegion: 'FC',
      postalCode: '12345',
      addressCountry: 'IN'
    },
    geo: {
      latitude: '28.6139',
      longitude: '77.2090'
    },
    openingHours: [
      'Mo-Fr 09:00-18:00',
      'Sa 09:00-16:00'
    ],
    priceRange: '$$',
    currencies: ['INR', 'USD']
  },

  // Images
  images: {
    logo: '/images/manafoods-logo.png',
    ogImage: '/images/manafoods-og-image.jpg',
    favicon: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png'
  },

  // Theme
  theme: {
    primaryColor: '#10b981',
    backgroundColor: '#ffffff'
  },

  // Analytics and Tracking
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '', // Replace with your GA4 ID
    googleTagManagerId: import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID || '', // Replace with your GTM ID
    facebookPixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID || '', // Replace with your Facebook Pixel ID
    hotjarId: import.meta.env.VITE_HOTJAR_ID || '' // Replace with your Hotjar ID
  },

  // Page-specific SEO configurations
  pages: {
    home: {
      title: 'MANAfoods - Premium Quality Food Products Online | Fresh Ingredients & Gourmet Selections',
      description: 'Discover premium quality food products at MANAfoods. Fresh ingredients, organic options, and gourmet selections delivered to your door. Shop chicken pickles, mutton pickles, veg pickles, and traditional gongura pickles with fast delivery and best prices.',
      keywords: [
        'premium food products',
        'online grocery store',
        'traditional pickles',
        'chicken pickles',
        'mutton pickles',
        'veg pickles',
        'gongura pickles',
        'fresh ingredients',
        'gourmet food delivery',
        'organic food online'
      ]
    },
    products: {
      title: 'Premium Food Products - Shop Online | MANAfoods',
      description: 'Shop premium food products at MANAfoods. Browse our complete collection of chicken pickles, mutton pickles, veg pickles, gongura pickles and more. Fast delivery, best prices.',
      keywords: [
        'food products online',
        'buy pickles online',
        'premium food shopping',
        'traditional food products',
        'gourmet food store'
      ]
    },
    blog: {
      title: 'Food Blog - Tips, Recipes & Insights | MANAfoods',
      description: 'Discover food tips, recipes, and insights on the MANAfoods blog. Learn about traditional pickles, cooking techniques, and healthy eating habits from our food experts.',
      keywords: [
        'food blog',
        'recipes',
        'cooking tips',
        'traditional pickles',
        'healthy eating',
        'food insights'
      ]
    },
    contact: {
      title: 'Contact Us - Get in Touch | MANAfoods',
      description: 'Contact MANAfoods for questions about our premium food products, orders, or support. Phone: +91 98765 43210, Email: support@manaeats.com. We\'re here to help!',
      keywords: [
        'contact MANAfoods',
        'customer support',
        'food products help',
        'order assistance'
      ]
    }
  },

  // Category-specific SEO
  categories: {
    'Chicken Pickles': {
      title: 'Premium Chicken Pickles - Traditional Spicy Flavors | MANAfoods',
      description: 'Discover authentic chicken pickles at MANAfoods. Made with traditional spices and premium chicken, our pickles deliver bold flavors and authentic taste. Order now for fast delivery.',
      keywords: ['chicken pickles', 'spicy chicken pickle', 'traditional chicken pickle', 'premium chicken pickle', 'authentic chicken pickle']
    },
    'Mutton Pickles': {
      title: 'Traditional Mutton Pickles - Rich & Tender | MANAfoods',
      description: 'Savor the rich taste of traditional mutton pickles from MANAfoods. Made with tender mutton and authentic spices for an unforgettable culinary experience.',
      keywords: ['mutton pickles', 'traditional mutton pickle', 'tender mutton pickle', 'premium mutton pickle', 'authentic mutton pickle']
    },
    'Veg Pickles': {
      title: 'Fresh Vegetable Pickles - Authentic Spices | MANAfoods',
      description: 'Enjoy fresh vegetable pickles made with authentic spices at MANAfoods. Our veg pickles combine traditional recipes with premium ingredients for exceptional taste.',
      keywords: ['veg pickles', 'vegetable pickles', 'fresh veg pickle', 'traditional veg pickle', 'authentic vegetable pickle']
    },
    'Gongura Pickles': {
      title: 'Traditional Gongura Pickles - Sorrel Leaf Delicacy | MANAfoods',
      description: 'Experience the unique taste of traditional gongura pickles from MANAfoods. Made with fresh sorrel leaves and authentic Andhra spices for a truly regional flavor.',
      keywords: ['gongura pickles', 'sorrel leaf pickle', 'traditional gongura', 'Andhra gongura pickle', 'authentic gongura pickle']
    }
  },

  // FAQ Data for structured data
  faqs: [
    {
      question: 'What types of food products does MANAfoods offer?',
      answer: 'MANAfoods specializes in premium quality food products including traditional pickles (chicken, mutton, vegetable, and gongura), fresh ingredients, organic options, and gourmet selections.'
    },
    {
      question: 'Do you deliver food products nationwide?',
      answer: 'Yes, we deliver our premium food products across India with fast and secure packaging to ensure freshness and quality.'
    },
    {
      question: 'Are your pickles made with authentic traditional recipes?',
      answer: 'Absolutely! Our pickles are made using traditional recipes passed down through generations, combined with premium ingredients and authentic spices.'
    },
    {
      question: 'How do you ensure the quality and freshness of your products?',
      answer: 'We maintain strict quality control measures, use premium ingredients, follow traditional preparation methods, and ensure proper packaging and storage to maintain freshness.'
    },
    {
      question: 'What is your return and refund policy?',
      answer: 'We offer a 30-day hassle-free return policy. If you\'re not satisfied with your purchase, contact our customer support for a full refund or replacement.'
    }
  ]
};

// Helper functions
export const getSEOConfig = (page: keyof typeof SEO_CONFIG.pages) => {
  return SEO_CONFIG.pages[page] || {
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    keywords: SEO_CONFIG.defaultKeywords
  };
};

export const getCategoryConfig = (category: string) => {
  return SEO_CONFIG.categories[category as keyof typeof SEO_CONFIG.categories] || {
    title: `${category} - Premium Food Products | MANAfoods`,
    description: `Shop premium ${category.toLowerCase()} at MANAfoods. High-quality products with fast delivery and best prices.`,
    keywords: [category.toLowerCase(), 'premium food', 'online grocery', 'MANAfoods']
  };
};

export const generatePageTitle = (title: string) => {
  return SEO_CONFIG.titleTemplate.replace('%s', title);
};

export const getFullImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) return imagePath;
  return `${SEO_CONFIG.siteUrl}${imagePath}`;
};

export const getCanonicalUrl = (path: string) => {
  return `${SEO_CONFIG.siteUrl}${path}`;
};