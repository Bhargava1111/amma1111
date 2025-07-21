import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Clock, 
  Globe, 
  Smartphone,
  Monitor,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface SEOMetrics {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  organicTraffic: number;
  mobileTraffic: number;
  desktopTraffic: number;
  topKeywords: Array<{ keyword: string; position: number; clicks: number }>;
  topPages: Array<{ page: string; views: number; ctr: number }>;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

const SEOMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchMetrics = async () => {
    setIsLoading(true);
    
    // Simulate API call - replace with actual analytics API
    setTimeout(() => {
      setMetrics({
        pageViews: 12543,
        uniqueVisitors: 8921,
        avgSessionDuration: 245,
        bounceRate: 32.5,
        organicTraffic: 68.2,
        mobileTraffic: 62.1,
        desktopTraffic: 37.9,
        topKeywords: [
          { keyword: 'chicken pickles online', position: 3, clicks: 234 },
          { keyword: 'traditional mutton pickle', position: 5, clicks: 189 },
          { keyword: 'gongura pickle buy', position: 2, clicks: 156 },
          { keyword: 'premium food products', position: 7, clicks: 143 },
          { keyword: 'organic pickles delivery', position: 4, clicks: 98 }
        ],
        topPages: [
          { page: '/', views: 3421, ctr: 4.2 },
          { page: '/products', views: 2876, ctr: 3.8 },
          { page: '/product/chicken-pickle-spicy', views: 1543, ctr: 5.1 },
          { page: '/products?category=Chicken%20Pickles', views: 1234, ctr: 4.7 },
          { page: '/blog', views: 987, ctr: 2.9 }
        ],
        coreWebVitals: {
          lcp: 2.1,
          fid: 89,
          cls: 0.08
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getVitalStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
        return value <= 2.5 ? 'good' : value <= 4.0 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      default:
        return 'good';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading SEO metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">SEO Performance Monitor</h2>
          <p className="text-gray-600 mt-2">Track your website's SEO performance and metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={fetchMetrics} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.5% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold">{metrics.uniqueVisitors.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8.3% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
                <p className="text-2xl font-bold">{formatDuration(metrics.avgSessionDuration)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5.2% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold">{metrics.bounceRate}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
              <span className="text-sm text-red-600">-3.1% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Organic Search</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${metrics.organicTraffic}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{metrics.organicTraffic}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Direct</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: '18.3%' }}
                        ></div>
                      </div>
                      <span className="font-semibold">18.3%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Social Media</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: '8.7%' }}
                        ></div>
                      </div>
                      <span className="font-semibold">8.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Referral</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: '4.8%' }}
                        ></div>
                      </div>
                      <span className="font-semibold">4.8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Mobile</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${metrics.mobileTraffic}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{metrics.mobileTraffic}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Monitor className="w-4 h-4 mr-2 text-green-500" />
                      <span>Desktop</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${metrics.desktopTraffic}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{metrics.desktopTraffic}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{keyword.keyword}</p>
                      <p className="text-sm text-gray-600">{keyword.clicks} clicks</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={
                          keyword.position <= 3 ? 'bg-green-100 text-green-800' :
                          keyword.position <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        Position #{keyword.position}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{page.page}</p>
                      <p className="text-sm text-gray-600">{page.views.toLocaleString()} views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{page.ctr}%</p>
                      <p className="text-sm text-gray-600">CTR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Largest Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{metrics.coreWebVitals.lcp}s</div>
                  <Badge className={getStatusColor(getVitalStatus('lcp', metrics.coreWebVitals.lcp))}>
                    {getVitalStatus('lcp', metrics.coreWebVitals.lcp).replace('-', ' ')}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Good: ≤2.5s | Needs Improvement: ≤4.0s | Poor: &gt;4.0s
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First Input Delay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{metrics.coreWebVitals.fid}ms</div>
                  <Badge className={getStatusColor(getVitalStatus('fid', metrics.coreWebVitals.fid))}>
                    {getVitalStatus('fid', metrics.coreWebVitals.fid).replace('-', ' ')}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Good: ≤100ms | Needs Improvement: ≤300ms | Poor: &gt;300ms
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cumulative Layout Shift</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{metrics.coreWebVitals.cls}</div>
                  <Badge className={getStatusColor(getVitalStatus('cls', metrics.coreWebVitals.cls))}>
                    {getVitalStatus('cls', metrics.coreWebVitals.cls).replace('-', ' ')}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Good: ≤0.1 | Needs Improvement: ≤0.25 | Poor: &gt;0.25
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOMonitor;