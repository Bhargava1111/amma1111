import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  Eye,
  MousePointer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    [key: string]: number;
  };
  byPriority: {
    [key: string]: number;
  };
  byChannel: {
    [key: string]: number;
  };
  byStatus: {
    [key: string]: number;
  };
}

interface TimeRangeStats {
  today: NotificationStats;
  week: NotificationStats;
  month: NotificationStats;
}

interface ChannelPerformance {
  channel: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
}

function NotificationAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {},
    byChannel: {},
    byStatus: {}
  });
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
    loadChannelPerformance();
    loadRecentNotifications();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/notifications/stats?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChannelPerformance = async () => {
    try {
      // Simulate channel performance data
      const performance: ChannelPerformance[] = [
        {
          channel: 'in_app',
          sent: 1250,
          delivered: 1200,
          read: 980,
          failed: 50,
          deliveryRate: 96.0,
          readRate: 81.7
        },
        {
          channel: 'email',
          sent: 2800,
          delivered: 2650,
          read: 1890,
          failed: 150,
          deliveryRate: 94.6,
          readRate: 71.3
        },
        {
          channel: 'whatsapp',
          sent: 1850,
          delivered: 1780,
          read: 1520,
          failed: 70,
          deliveryRate: 96.2,
          readRate: 85.4
        },
        {
          channel: 'push',
          sent: 3200,
          delivered: 2900,
          read: 2150,
          failed: 300,
          deliveryRate: 90.6,
          readRate: 74.1
        }
      ];
      
      setChannelPerformance(performance);
    } catch (error) {
      console.error('Error loading channel performance:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const result = await window.ezsite.apis.tablePage('10412', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'created_at',
        IsAsc: false
      });

      if (result.data && result.data.List) {
        setRecentNotifications(result.data.List);
      }
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await Promise.all([
      loadAnalytics(),
      loadChannelPerformance(),
      loadRecentNotifications()
    ]);
    setRefreshing(false);
    toast({
      title: 'Analytics Refreshed',
      description: 'Notification analytics have been updated'
    });
  };

  const exportAnalytics = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Notifications', stats.total.toString()],
      ['Unread Notifications', stats.unread.toString()],
      ['Delivery Rate', `${((stats.byStatus.delivered || 0) / stats.total * 100).toFixed(1)}%`],
      ['Read Rate', `${((stats.byStatus.read || 0) / stats.total * 100).toFixed(1)}%`],
      ['Failed Rate', `${((stats.byStatus.failed || 0) / stats.total * 100).toFixed(1)}%`],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'in_app': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'push': return 'bg-purple-100 text-purple-800';
      case 'in_app': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛒';
      case 'system': return '🔔';
      case 'promotion': return '🎉';
      case 'campaign': return '📢';
      default: return '💬';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Analytics</h2>
          <p className="text-gray-600">Monitor notification performance and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: 'today' | 'week' | 'month') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={refreshAnalytics} disabled={refreshing}>
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(stats.total, stats.total * 0.9)}
              <span className="ml-1">+10% from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? ((stats.byStatus.delivered || 0) / stats.total * 100).toFixed(1) : 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="ml-1">+2.5% from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? ((stats.byStatus.read || 0) / stats.total * 100).toFixed(1) : 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="ml-1">+1.8% from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? ((stats.byStatus.failed || 0) / stats.total * 100).toFixed(1) : 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="ml-1">-0.3% from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">Channel Performance</TabsTrigger>
          <TabsTrigger value="types">Notification Types</TabsTrigger>
          <TabsTrigger value="priority">Priority Distribution</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channelPerformance.map((channel) => (
              <Card key={channel.channel}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel.channel)}
                      <CardTitle className="text-sm font-medium capitalize">
                        {channel.channel.replace('_', ' ')}
                      </CardTitle>
                    </div>
                    <Badge className={getChannelColor(channel.channel)}>
                      {channel.sent.toLocaleString()} sent
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Delivery Rate</span>
                      <span className="font-medium">{channel.deliveryRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={channel.deliveryRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Read Rate</span>
                      <span className="font-medium">{channel.readRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={channel.readRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{channel.delivered.toLocaleString()}</div>
                      <div className="text-muted-foreground">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{channel.read.toLocaleString()}</div>
                      <div className="text-muted-foreground">Read</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{channel.failed.toLocaleString()}</div>
                      <div className="text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Types Distribution</CardTitle>
              <CardDescription>Breakdown of notifications by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(type)}</span>
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Breakdown of notifications by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(priority)}>
                        {priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest notification activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotifications.map((notification) => {
                  const metadata = JSON.parse(notification.metadata || '{}');
                  return (
                    <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-500">
                            {notification.message?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(metadata.priority || 'normal')}>
                          {metadata.priority || 'normal'}
                        </Badge>
                        <Badge className={getChannelColor(notification.channel)}>
                          {notification.channel}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationAnalytics; 