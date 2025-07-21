// Sitemap generator utility for MANAfoods
import { SEO_CONFIG } from '../config/seo';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
}

export class SitemapGenerator {
  private urls: SitemapUrl[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = SEO_CONFIG.siteUrl) {
    this.baseUrl = baseUrl;
  }

  // Add a URL to the sitemap
  addUrl(url: SitemapUrl) {
    this.urls.push({
      ...url,
      loc: url.loc.startsWith('http') ? url.loc : `${this.baseUrl}${url.loc}`
    });
  }

  // Add static pages
  addStaticPages() {
    const staticPages = [
      {
        loc: '/',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily' as const,
        priority: 1.0,
        images: [
          {
            loc: `${this.baseUrl}/images/manafoods-homepage-banner.jpg`,
            title: 'MANAfoods - Premium Quality Food Products',
            caption: 'Discover premium quality food products at MANAfoods'
          }
        ]
      },
      {
        loc: '/products',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily' as const,
        priority: 0.9
      },
      {
        loc: '/blog',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly' as const,
        priority: 0.7
      },
      {
        loc: '/contact',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly' as const,
        priority: 0.6
      },
      {
        loc: '/auth',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly' as const,
        priority: 0.5
      }
    ];

    staticPages.forEach(page => this.addUrl(page));
  }

  // Add category pages
  addCategoryPages() {
    const categories = Object.keys(SEO_CONFIG.categories);
    
    categories.forEach(category => {
      this.addUrl({
        loc: `/products?category=${encodeURIComponent(category)}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      });
    });
  }

  // Add product pages (to be called with actual product data)
  addProductPages(products: Array<{ id: string; name: string; category: string; images?: string[]; updatedAt?: string }>) {
    products.forEach(product => {
      const images = product.images?.map(img => ({
        loc: img.startsWith('http') ? img : `${this.baseUrl}${img}`,
        title: product.name,
        caption: `${product.name} - Premium ${product.category}`
      }));

      this.addUrl({
        loc: `/product/${product.id}`,
        lastmod: product.updatedAt || new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8,
        images
      });
    });
  }

  // Add blog posts (to be called with actual blog data)
  addBlogPosts(posts: Array<{ id: string; title: string; updatedAt?: string; image?: string }>) {
    posts.forEach(post => {
      const images = post.image ? [{
        loc: post.image.startsWith('http') ? post.image : `${this.baseUrl}${post.image}`,
        title: post.title,
        caption: `${post.title} - MANAfoods Blog`
      }] : undefined;

      this.addUrl({
        loc: `/blog/${post.id}`,
        lastmod: post.updatedAt || new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: 0.6,
        images
      });
    });
  }

  // Generate XML sitemap
  generateXML(): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    const urlsetClose = '</urlset>';

    const urlsXML = this.urls.map(url => {
      let urlXML = '  <url>\n';
      urlXML += `    <loc>${this.escapeXML(url.loc)}</loc>\n`;
      
      if (url.lastmod) {
        urlXML += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        urlXML += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority !== undefined) {
        urlXML += `    <priority>${url.priority}</priority>\n`;
      }

      // Add image information
      if (url.images && url.images.length > 0) {
        url.images.forEach(image => {
          urlXML += '    <image:image>\n';
          urlXML += `      <image:loc>${this.escapeXML(image.loc)}</image:loc>\n`;
          if (image.title) {
            urlXML += `      <image:title>${this.escapeXML(image.title)}</image:title>\n`;
          }
          if (image.caption) {
            urlXML += `      <image:caption>${this.escapeXML(image.caption)}</image:caption>\n`;
          }
          urlXML += '    </image:image>\n';
        });
      }

      urlXML += '  </url>\n';
      return urlXML;
    }).join('');

    return xmlHeader + urlsetOpen + urlsXML + urlsetClose;
  }

  // Generate sitemap index for large sites
  generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const sitemapIndexClose = '</sitemapindex>';

    const sitemapsXML = sitemaps.map(sitemap => {
      let sitemapXML = '  <sitemap>\n';
      sitemapXML += `    <loc>${this.escapeXML(sitemap.loc)}</loc>\n`;
      if (sitemap.lastmod) {
        sitemapXML += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
      }
      sitemapXML += '  </sitemap>\n';
      return sitemapXML;
    }).join('');

    return xmlHeader + sitemapIndexOpen + sitemapsXML + sitemapIndexClose;
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    const disallowedPaths = [
      '/admin',
      '/profile',
      '/checkout',
      '/orders',
      '/onauthsuccess',
      '/resetpassword',
      '/cart',
      '/wishlist'
    ];

    let robotsTxt = 'User-agent: *\n';
    robotsTxt += 'Allow: /\n\n';
    
    robotsTxt += '# Disallow admin and private pages\n';
    disallowedPaths.forEach(path => {
      robotsTxt += `Disallow: ${path}\n`;
    });
    
    robotsTxt += '\n# Allow important pages\n';
    robotsTxt += 'Allow: /\n';
    robotsTxt += 'Allow: /products\n';
    robotsTxt += 'Allow: /blog\n';
    robotsTxt += 'Allow: /contact\n';
    robotsTxt += 'Allow: /auth\n\n';
    
    robotsTxt += `# Sitemap location\n`;
    robotsTxt += `Sitemap: ${this.baseUrl}/sitemap.xml\n\n`;
    
    robotsTxt += '# Crawl delay (optional)\n';
    robotsTxt += 'Crawl-delay: 1\n';

    return robotsTxt;
  }

  // Helper method to escape XML characters
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Get all URLs
  getUrls(): SitemapUrl[] {
    return this.urls;
  }

  // Clear all URLs
  clear() {
    this.urls = [];
  }
}

// Helper function to generate complete sitemap
export const generateCompleteSitemap = async (
  products?: Array<{ id: string; name: string; category: string; images?: string[]; updatedAt?: string }>,
  blogPosts?: Array<{ id: string; title: string; updatedAt?: string; image?: string }>
): Promise<string> => {
  const generator = new SitemapGenerator();
  
  // Add static pages
  generator.addStaticPages();
  
  // Add category pages
  generator.addCategoryPages();
  
  // Add product pages if provided
  if (products && products.length > 0) {
    generator.addProductPages(products);
  }
  
  // Add blog posts if provided
  if (blogPosts && blogPosts.length > 0) {
    generator.addBlogPosts(blogPosts);
  }
  
  return generator.generateXML();
};

// Helper function to generate robots.txt
export const generateRobotsTxt = (): string => {
  const generator = new SitemapGenerator();
  return generator.generateRobotsTxt();
};

export default SitemapGenerator;