import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SEOAuditItem {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  recommendation?: string;
}

interface SEOAuditProps {
  url?: string;
}

const SEOAudit: React.FC<SEOAuditProps> = ({ url = window.location.href }) => {
  const [auditResults, setAuditResults] = useState<SEOAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const runAudit = async () => {
    setIsLoading(true);
    
    const results: SEOAuditItem[] = [];
    
    // Check page title
    const title = document.title;
    results.push({
      id: 'title',
      title: 'Page Title',
      description: `Title: "${title}"`,
      status: title && title.length >= 30 && title.length <= 60 ? 'pass' : 'warning',
      score: title && title.length >= 30 && title.length <= 60 ? 100 : 70,
      recommendation: title.length < 30 ? 'Title is too short. Aim for 30-60 characters.' : 
                     title.length > 60 ? 'Title is too long. Keep it under 60 characters.' : undefined
    });

    // Check meta description
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    results.push({
      id: 'description',
      title: 'Meta Description',
      description: metaDescription ? `Description: "${metaDescription.substring(0, 100)}..."` : 'No meta description found',
      status: metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160 ? 'pass' : 'warning',
      score: metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160 ? 100 : 60,
      recommendation: !metaDescription ? 'Add a meta description.' :
                     metaDescription.length < 120 ? 'Meta description is too short. Aim for 120-160 characters.' :
                     metaDescription.length > 160 ? 'Meta description is too long. Keep it under 160 characters.' : undefined
    });

    // Check H1 tags
    const h1Tags = document.querySelectorAll('h1');
    results.push({
      id: 'h1',
      title: 'H1 Tags',
      description: `Found ${h1Tags.length} H1 tag(s)`,
      status: h1Tags.length === 1 ? 'pass' : h1Tags.length === 0 ? 'fail' : 'warning',
      score: h1Tags.length === 1 ? 100 : h1Tags.length === 0 ? 0 : 50,
      recommendation: h1Tags.length === 0 ? 'Add exactly one H1 tag per page.' :
                     h1Tags.length > 1 ? 'Use only one H1 tag per page.' : undefined
    });

    // Check images with alt text
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt'));
    const altTextScore = images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100;
    results.push({
      id: 'alt-text',
      title: 'Image Alt Text',
      description: `${imagesWithAlt.length}/${images.length} images have alt text`,
      status: altTextScore === 100 ? 'pass' : altTextScore >= 80 ? 'warning' : 'fail',
      score: altTextScore,
      recommendation: altTextScore < 100 ? 'Add alt text to all images for better accessibility and SEO.' : undefined
    });

    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    results.push({
      id: 'canonical',
      title: 'Canonical URL',
      description: canonical ? `Canonical URL set: ${canonical.getAttribute('href')}` : 'No canonical URL found',
      status: canonical ? 'pass' : 'warning',
      score: canonical ? 100 : 70,
      recommendation: !canonical ? 'Add a canonical URL to prevent duplicate content issues.' : undefined
    });

    // Check Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogScore = [ogTitle, ogDescription, ogImage].filter(Boolean).length / 3 * 100;
    results.push({
      id: 'open-graph',
      title: 'Open Graph Tags',
      description: `${[ogTitle, ogDescription, ogImage].filter(Boolean).length}/3 essential OG tags present`,
      status: ogScore === 100 ? 'pass' : ogScore >= 66 ? 'warning' : 'fail',
      score: ogScore,
      recommendation: ogScore < 100 ? 'Add missing Open Graph tags (og:title, og:description, og:image) for better social media sharing.' : undefined
    });

    // Check Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterScore = [twitterCard, twitterTitle, twitterDescription].filter(Boolean).length / 3 * 100;
    results.push({
      id: 'twitter-cards',
      title: 'Twitter Cards',
      description: `${[twitterCard, twitterTitle, twitterDescription].filter(Boolean).length}/3 Twitter Card tags present`,
      status: twitterScore === 100 ? 'pass' : twitterScore >= 66 ? 'warning' : 'fail',
      score: twitterScore,
      recommendation: twitterScore < 100 ? 'Add missing Twitter Card tags for better Twitter sharing.' : undefined
    });

    // Check structured data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    results.push({
      id: 'structured-data',
      title: 'Structured Data',
      description: `Found ${structuredData.length} structured data script(s)`,
      status: structuredData.length > 0 ? 'pass' : 'warning',
      score: structuredData.length > 0 ? 100 : 50,
      recommendation: structuredData.length === 0 ? 'Add structured data (JSON-LD) to help search engines understand your content.' : undefined
    });

    // Check page loading speed (simplified)
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    const speedScore = loadTime < 3000 ? 100 : loadTime < 5000 ? 80 : loadTime < 7000 ? 60 : 40;
    results.push({
      id: 'page-speed',
      title: 'Page Load Speed',
      description: `Page loaded in ${(loadTime / 1000).toFixed(2)} seconds`,
      status: speedScore >= 80 ? 'pass' : speedScore >= 60 ? 'warning' : 'fail',
      score: speedScore,
      recommendation: speedScore < 80 ? 'Optimize images, minify CSS/JS, and use a CDN to improve loading speed.' : undefined
    });

    // Check mobile viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    results.push({
      id: 'viewport',
      title: 'Mobile Viewport',
      description: viewport ? 'Viewport meta tag present' : 'No viewport meta tag found',
      status: viewport ? 'pass' : 'fail',
      score: viewport ? 100 : 0,
      recommendation: !viewport ? 'Add a viewport meta tag for mobile responsiveness.' : undefined
    });

    setAuditResults(results);
    
    // Calculate overall score
    const totalScore = results.reduce((sum, item) => sum + item.score, 0);
    const avgScore = Math.round(totalScore / results.length);
    setOverallScore(avgScore);
    
    setIsLoading(false);
  };

  useEffect(() => {
    runAudit();
  }, [url]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">SEO Audit Results</CardTitle>
            <p className="text-gray-600 mt-2">Comprehensive SEO analysis for your page</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(overallScore)}`}>
              {overallScore}/100
            </div>
            <p className="text-sm text-gray-600 mt-1">Overall Score</p>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAudit} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-run Audit
              </>
            )}
          </Button>
          
          <div className="grid gap-4">
            {auditResults.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <Badge className={getScoreColor(item.score)}>
                      {item.score}/100
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  {item.recommendation && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                      <p className="text-blue-800 text-sm">
                        <strong>Recommendation:</strong> {item.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOAudit;