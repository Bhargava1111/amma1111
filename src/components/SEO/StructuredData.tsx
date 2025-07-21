import { Helmet } from 'react-helmet-async';

interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs?: string[];
}

interface ProductSchema {
  name: string;
  description: string;
  image: string[];
  brand: string;
  sku: string;
  offers: {
    price: string;
    currency: string;
    availability: string;
    url: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      ratingValue: number;
    };
  }>;
}

interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface ArticleSchema {
  headline: string;
  description: string;
  image: string;
  author: string;
  publisher: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}

interface WebsiteSchema {
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

interface StructuredDataProps {
  organization?: OrganizationSchema;
  product?: ProductSchema;
  breadcrumb?: BreadcrumbSchema;
  article?: ArticleSchema;
  website?: WebsiteSchema;
}

const StructuredData: React.FC<StructuredDataProps> = ({
  organization,
  product,
  breadcrumb,
  article,
  website
}) => {
  const generateSchema = () => {
    const schemas = [];

    if (organization) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": organization.name,
        "url": organization.url,
        "logo": organization.logo,
        "description": organization.description,
        ...(organization.contactPoint && {
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": organization.contactPoint.telephone,
            "contactType": organization.contactPoint.contactType,
            "email": organization.contactPoint.email
          }
        }),
        ...(organization.sameAs && { "sameAs": organization.sameAs })
      });
    }

    if (product) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "brand": {
          "@type": "Brand",
          "name": product.brand
        },
        "sku": product.sku,
        "offers": {
          "@type": "Offer",
          "price": product.offers.price,
          "priceCurrency": product.offers.currency,
          "availability": `https://schema.org/${product.offers.availability}`,
          "url": product.offers.url
        },
        ...(product.aggregateRating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.aggregateRating.ratingValue,
            "reviewCount": product.aggregateRating.reviewCount
          }
        }),
        ...(product.review && {
          "review": product.review.map(review => ({
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": review.author
            },
            "datePublished": review.datePublished,
            "reviewBody": review.reviewBody,
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": review.reviewRating.ratingValue
            }
          }))
        })
      });
    }

    if (breadcrumb) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumb.items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      });
    }

    if (article) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.headline,
        "description": article.description,
        "image": article.image,
        "author": {
          "@type": "Person",
          "name": article.author
        },
        "publisher": {
          "@type": "Organization",
          "name": article.publisher
        },
        "datePublished": article.datePublished,
        ...(article.dateModified && { "dateModified": article.dateModified }),
        "url": article.url
      });
    }

    if (website) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": website.name,
        "url": website.url,
        "description": website.description,
        ...(website.potentialAction && {
          "potentialAction": {
            "@type": "SearchAction",
            "target": website.potentialAction.target,
            "query-input": website.potentialAction.queryInput
          }
        })
      });
    }

    return schemas;
  };

  const schemas = generateSchema();

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
};

export default StructuredData;