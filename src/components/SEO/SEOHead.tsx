import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: string;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'MANAfoods - Premium Quality Food Products Online',
  description = 'Discover premium quality food products at MANAfoods. Fresh ingredients, organic options, and gourmet selections delivered to your door. Shop now for the best in food quality and taste.',
  keywords = 'food products, organic food, gourmet food, fresh ingredients, online grocery, premium food, healthy eating, food delivery',
  image = '/images/manafoods-og-image.jpg',
  url = window.location.href,
  type = 'website',
  author = 'MANAfoods Team',
  publishedTime,
  modifiedTime,
  price,
  currency = 'USD',
  availability,
  brand = 'MANAfoods',
  category,
  noIndex = false,
  canonicalUrl
}) => {
  const siteUrl = 'https://manafoods.com'; // Replace with your actual domain
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}/${image.startsWith('/') ? image.substring(1) : image}`;
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const canonical = canonicalUrl || fullUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonical} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="MANAfoods" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@manafoods" />
      <meta name="twitter:creator" content="@manafoods" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Product specific */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}
      {type === 'product' && availability && (
        <meta property="product:availability" content={availability} />
      )}
      {type === 'product' && brand && (
        <meta property="product:brand" content={brand} />
      )}
      {type === 'product' && category && (
        <meta property="product:category" content={category} />
      )}
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-TileColor" content="#10b981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
    </Helmet>
  );
};

export default SEOHead;
