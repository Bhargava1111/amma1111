import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  twitterHandle?: string;
  fbAppId?: string;
  themeColor?: string;
  robots?: string;
  canonical?: string;
  alternateLanguages?: Array<{
    hreflang: string;
    href: string;
  }>;
  openingHours?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title = 'MANAfoods - Premium Quality Food Products Online',
  description = 'Discover premium quality food products at MANAfoods. Fresh ingredients, organic options, and gourmet selections delivered to your door.',
  keywords = 'food products, organic food, gourmet food, fresh ingredients, online grocery, premium food',
  image = '/images/manafoods-og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  siteName = 'MANAfoods',
  locale = 'en_US',
  twitterHandle = '@manafoods',
  fbAppId,
  themeColor = '#10b981',
  robots = 'index,follow',
  canonical,
  alternateLanguages = [],
  openingHours = [],
  contactInfo
}) => {
  const siteUrl = 'https://manafoods.com'; // Replace with your actual domain
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}/${image.startsWith('/') ? image.substring(1) : image}`;
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const canonicalUrl = canonical || fullUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Alternate Language Links */}
      {alternateLanguages.map((lang, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={lang.hreflang}
          href={lang.href}
        />
      ))}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {fbAppId && <meta property="fb:app_id" content={fbAppId} />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Mobile and App Meta Tags */}
      <meta name="theme-color" content={themeColor} />
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="HandheldFriendly" content="true" />
      <meta name="MobileOptimized" content="width" />
      
      {/* Business Information */}
      {contactInfo?.phone && (
        <meta name="telephone" content={contactInfo.phone} />
      )}
      {contactInfo?.email && (
        <meta name="email" content={contactInfo.email} />
      )}
      {contactInfo?.address && (
        <meta name="address" content={contactInfo.address} />
      )}
      
      {/* Opening Hours */}
      {openingHours.length > 0 && (
        <meta name="opening_hours" content={openingHours.join(', ')} />
      )}
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.manafoods.com" />
      
      {/* DNS Prefetch for external resources */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Helmet>
  );
};

export default MetaTags;
