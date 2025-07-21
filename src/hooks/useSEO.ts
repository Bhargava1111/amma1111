import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

export const useSEO = (config: SEOConfig) => {
  const location = useLocation();

  useEffect(() => {
    // Update page title
    if (config.title) {
      document.title = config.title;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && config.description) {
      metaDescription.setAttribute('content', config.description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && config.keywords) {
      metaKeywords.setAttribute('content', config.keywords);
    }

    // Update robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (config.noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex,nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.href);

  }, [config, location]);
};

// SEO utility functions
export const generateSEOTitle = (pageTitle: string, siteName = 'MANAfoods') => {
  return `${pageTitle} | ${siteName}`;
};

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

export const truncateDescription = (text: string, maxLength = 160) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const generateProductDescription = (productName: string, features: string[], category?: string) => {
  const baseDesc = `Shop ${productName} at MANAfoods.`;
  const featuresText = features.length > 0 ? ` ${features.join(', ')}.` : '';
  const categoryText = category ? ` Premium ${category.toLowerCase()} products.` : '';
  const cta = ' Order now for fast delivery and best prices.';
  
  return truncateDescription(baseDesc + featuresText + categoryText + cta);
};

export const generateCategoryDescription = (categoryName: string, productCount?: number) => {
  const baseDesc = `Discover premium ${categoryName.toLowerCase()} products at MANAfoods.`;
  const countText = productCount ? ` Browse ${productCount}+ quality items.` : '';
  const cta = ' Fresh ingredients, organic options, and gourmet selections with fast delivery.';
  
  return truncateDescription(baseDesc + countText + cta);
};