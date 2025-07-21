import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG } from '../../config/seo';

interface SEOProviderProps {
  children: React.ReactNode;
}

const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Track page views with Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', SEO_CONFIG.analytics.googleAnalyticsId, {
        page_path: location.pathname + location.search,
      });
    }

    // Track page views with Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }

    // Update page title in browser tab
    document.title = SEO_CONFIG.defaultTitle;
  }, [location]);

  return (
    <>
      <Helmet>
        {/* Global Meta Tags */}
        <html lang="en" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Default SEO Tags */}
        <title>{SEO_CONFIG.defaultTitle}</title>
        <meta name="description" content={SEO_CONFIG.defaultDescription} />
        <meta name="keywords" content={SEO_CONFIG.defaultKeywords.join(', ')} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${SEO_CONFIG.siteUrl}${location.pathname}`} />
        
        {/* Open Graph */}
        <meta property="og:site_name" content={SEO_CONFIG.siteName} />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:site" content={SEO_CONFIG.social.twitter} />
        <meta name="twitter:creator" content={SEO_CONFIG.social.twitter} />
        
        {/* Theme and App */}
        <meta name="theme-color" content={SEO_CONFIG.theme.primaryColor} />
        <meta name="msapplication-TileColor" content={SEO_CONFIG.theme.primaryColor} />
        <meta name="application-name" content={SEO_CONFIG.siteName} />
        <meta name="apple-mobile-web-app-title" content={SEO_CONFIG.siteName} />
        
        {/* Icons */}
        <link rel="icon" href={SEO_CONFIG.images.favicon} />
        <link rel="apple-touch-icon" href={SEO_CONFIG.images.appleTouchIcon} />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        
        {/* Google Analytics */}
        {SEO_CONFIG.analytics.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${SEO_CONFIG.analytics.googleAnalyticsId}`}
            />
            <script>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${SEO_CONFIG.analytics.googleAnalyticsId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `}
            </script>
          </>
        )}
        
        {/* Google Tag Manager */}
        {SEO_CONFIG.analytics.googleTagManagerId && (
          <>
            <script>
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${SEO_CONFIG.analytics.googleTagManagerId}');
              `}
            </script>
          </>
        )}
        
        {/* Facebook Pixel */}
        {SEO_CONFIG.analytics.facebookPixelId && (
          <script>
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${SEO_CONFIG.analytics.facebookPixelId}');
              fbq('track', 'PageView');
            `}
          </script>
        )}
        
        {/* Hotjar */}
        {SEO_CONFIG.analytics.hotjarId && (
          <script>
            {`
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${SEO_CONFIG.analytics.hotjarId},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `}
          </script>
        )}
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
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
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": SEO_CONFIG.business.phone,
              "contactType": "customer service",
              "email": SEO_CONFIG.business.email,
              "availableLanguage": ["English", "Hindi"]
            },
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
          })}
        </script>
        
        {/* Structured Data - Website */}
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      </Helmet>
      
      {/* Google Tag Manager (noscript) */}
      {SEO_CONFIG.analytics.googleTagManagerId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${SEO_CONFIG.analytics.googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}
      
      {children}
    </>
  );
};

export default SEOProvider;