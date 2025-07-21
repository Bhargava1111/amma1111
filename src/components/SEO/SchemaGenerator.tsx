import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG } from '../../config/seo';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image: string[];
  brand?: string;
  category: string;
  sku?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  rating?: number;
  reviewCount?: number;
  reviews?: Array<{
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

interface Article {
  headline: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  wordCount?: number;
  articleSection?: string;
  tags?: string[];
}

interface LocalBusiness {
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: string;
    longitude: string;
  };
  openingHours: string[];
  priceRange: string;
  paymentAccepted?: string[];
  currenciesAccepted?: string[];
}

interface SchemaGeneratorProps {
  type: 'product' | 'article' | 'organization' | 'website' | 'breadcrumb' | 'faq' | 'local-business' | 'recipe' | 'event';
  data: any;
}

const SchemaGenerator: React.FC<SchemaGeneratorProps> = ({ type, data }) => {
  const generateProductSchema = (product: Product) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": product.brand || SEO_CONFIG.business.name
    },
    "sku": product.sku || product.id,
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": product.currency || "INR",
      "availability": `https://schema.org/${product.availability}`,
      "url": `${SEO_CONFIG.siteUrl}/product/${product.id}`,
      "seller": {
        "@type": "Organization",
        "name": SEO_CONFIG.business.name
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": `https://schema.org/${product.condition || 'NewCondition'}`
    },
    ...(product.rating && product.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    ...(product.reviews && product.reviews.length > 0 && {
      "review": product.reviews.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": 5,
          "worstRating": 1
        },
        "reviewBody": review.comment,
        "datePublished": review.date
      }))
    })
  });

  const generateArticleSchema = (article: Article) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "image": {
      "@type": "ImageObject",
      "url": article.image,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": `${SEO_CONFIG.siteUrl}/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`
    },
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.business.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_CONFIG.siteUrl}${SEO_CONFIG.images.logo}`,
        "width": 300,
        "height": 100
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "url": article.url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    ...(article.wordCount && { "wordCount": article.wordCount }),
    ...(article.articleSection && { "articleSection": article.articleSection }),
    ...(article.tags && { "keywords": article.tags.join(', ') })
  });

  const generateOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SEO_CONFIG.business.name,
    "legalName": SEO_CONFIG.business.legalName,
    "url": SEO_CONFIG.siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${SEO_CONFIG.siteUrl}${SEO_CONFIG.images.logo}`,
      "width": 300,
      "height": 100
    },
    "description": SEO_CONFIG.defaultDescription,
    "foundingDate": SEO_CONFIG.business.foundingDate,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": SEO_CONFIG.business.phone,
        "contactType": "customer service",
        "email": SEO_CONFIG.business.email,
        "availableLanguage": ["English", "Hindi"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SEO_CONFIG.business.address.streetAddress,
      "addressLocality": SEO_CONFIG.business.address.addressLocality,
      "addressRegion": SEO_CONFIG.business.address.addressRegion,
      "postalCode": SEO_CONFIG.business.address.postalCode,
      "addressCountry": SEO_CONFIG.business.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": SEO_CONFIG.business.geo.latitude,
      "longitude": SEO_CONFIG.business.geo.longitude
    },
    "sameAs": [
      SEO_CONFIG.social.facebook,
      SEO_CONFIG.social.twitter,
      SEO_CONFIG.social.instagram,
      SEO_CONFIG.social.linkedin
    ]
  });

  const generateWebsiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "description": SEO_CONFIG.defaultDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SEO_CONFIG.siteUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.business.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_CONFIG.siteUrl}${SEO_CONFIG.images.logo}`
      }
    }
  });

  const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  });

  const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
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
  });

  const generateLocalBusinessSchema = (business: LocalBusiness) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description,
    "url": business.url,
    "telephone": business.telephone,
    "email": business.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address.streetAddress,
      "addressLocality": business.address.addressLocality,
      "addressRegion": business.address.addressRegion,
      "postalCode": business.address.postalCode,
      "addressCountry": business.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": business.geo.latitude,
      "longitude": business.geo.longitude
    },
    "openingHours": business.openingHours,
    "priceRange": business.priceRange,
    ...(business.paymentAccepted && { "paymentAccepted": business.paymentAccepted }),
    ...(business.currenciesAccepted && { "currenciesAccepted": business.currenciesAccepted })
  });

  const generateRecipeSchema = (recipe: any) => ({
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.name,
    "description": recipe.description,
    "image": recipe.image,
    "author": {
      "@type": "Person",
      "name": recipe.author
    },
    "datePublished": recipe.datePublished,
    "prepTime": recipe.prepTime,
    "cookTime": recipe.cookTime,
    "totalTime": recipe.totalTime,
    "recipeYield": recipe.yield,
    "recipeCategory": recipe.category,
    "recipeCuisine": recipe.cuisine,
    "recipeIngredient": recipe.ingredients,
    "recipeInstructions": recipe.instructions.map((instruction: string, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": instruction
    })),
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": recipe.nutrition?.calories,
      "fatContent": recipe.nutrition?.fat,
      "carbohydrateContent": recipe.nutrition?.carbs,
      "proteinContent": recipe.nutrition?.protein
    },
    ...(recipe.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": recipe.rating,
        "reviewCount": recipe.reviewCount || 1
      }
    })
  });

  const generateEventSchema = (event: any) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "image": event.image,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": {
      "@type": "Place",
      "name": event.location.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.location.address.streetAddress,
        "addressLocality": event.location.address.addressLocality,
        "addressRegion": event.location.address.addressRegion,
        "postalCode": event.location.address.postalCode,
        "addressCountry": event.location.address.addressCountry
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": SEO_CONFIG.business.name,
      "url": SEO_CONFIG.siteUrl
    },
    ...(event.offers && {
      "offers": {
        "@type": "Offer",
        "price": event.offers.price,
        "priceCurrency": event.offers.currency || "INR",
        "availability": "https://schema.org/InStock",
        "url": event.offers.url
      }
    })
  });

  const getSchema = () => {
    switch (type) {
      case 'product':
        return generateProductSchema(data);
      case 'article':
        return generateArticleSchema(data);
      case 'organization':
        return generateOrganizationSchema();
      case 'website':
        return generateWebsiteSchema();
      case 'breadcrumb':
        return generateBreadcrumbSchema(data);
      case 'faq':
        return generateFAQSchema(data);
      case 'local-business':
        return generateLocalBusinessSchema(data);
      case 'recipe':
        return generateRecipeSchema(data);
      case 'event':
        return generateEventSchema(data);
      default:
        return null;
    }
  };

  const schema = getSchema();

  if (!schema) {
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema, null, 2)}
      </script>
    </Helmet>
  );
};

export default SchemaGenerator;