import React from 'react';
import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  data: object | object[];
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  const jsonLdData = Array.isArray(data) ? data : [data];

  return (
    <Helmet>
      {jsonLdData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 2)
          }}
        />
      ))}
    </Helmet>
  );
};

// Predefined structured data generators
export const generateWebsiteSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MANAfoods",
  "url": siteUrl,
  "description": "Premium quality food products and online grocery delivery service",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/products?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "MANAfoods",
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/images/manafoods-logo.png`
    }
  }
});

export const generateOrganizationSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MANAfoods",
  "url": siteUrl,
  "logo": {
    "@type": "ImageObject",
    "url": `${siteUrl}/images/manafoods-logo.png`,
    "width": 300,
    "height": 100
  },
  "description": "Premium quality food products and online grocery delivery service specializing in traditional pickles and gourmet selections",
  "foundingDate": "2024",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+91-98765-43210",
      "contactType": "customer service",
      "email": "support@manaeats.com",
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
    "streetAddress": "123 Food Street",
    "addressLocality": "Food City",
    "addressRegion": "FC",
    "postalCode": "12345",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://facebook.com/manafoods",
    "https://twitter.com/manafoods",
    "https://instagram.com/manafoods",
    "https://linkedin.com/company/manafoods"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Food Products",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Chicken Pickles",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Premium Chicken Pickle",
              "category": "Pickles"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Mutton Pickles",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Traditional Mutton Pickle",
              "category": "Pickles"
            }
          }
        ]
      }
    ]
  }
});

export const generateFoodEstablishmentSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "MANAfoods",
  "url": siteUrl,
  "description": "Premium quality food products and online grocery delivery service",
  "image": `${siteUrl}/images/manafoods-store.jpg`,
  "telephone": "+91-98765-43210",
  "email": "support@manaeats.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Food Street",
    "addressLocality": "Food City",
    "addressRegion": "FC",
    "postalCode": "12345",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "28.6139",
    "longitude": "77.2090"
  },
  "openingHours": [
    "Mo-Fr 09:00-18:00",
    "Sa 09:00-16:00"
  ],
  "priceRange": "$$",
  "servesCuisine": ["Indian", "Traditional", "Gourmet"],
  "acceptsReservations": false,
  "hasMenu": {
    "@type": "Menu",
    "name": "Food Products Menu",
    "description": "Premium food products including traditional pickles and gourmet selections",
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Pickles",
        "description": "Traditional and gourmet pickle varieties",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "Chicken Pickle",
            "description": "Spicy and flavorful chicken pickles made with traditional spices"
          },
          {
            "@type": "MenuItem",
            "name": "Mutton Pickle",
            "description": "Rich and tender mutton pickles with authentic flavors"
          }
        ]
      }
    ]
  }
});

export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
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

export default JsonLd;