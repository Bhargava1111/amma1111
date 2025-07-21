import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Eye, Trash2, MoreVertical, CheckCheck, Filter, RefreshCw, ExternalLink, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '../services/NotificationService';

interface EnhancedNotification {
  ID?: number; // ezsite API field
  id?: string | number; // database field  
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'campaign' | 'system' | 'promotion';
  channel: 'email' | 'whatsapp' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  is_read: boolean;
  campaign_id?: string;
  metadata: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  sent_at: string;
  created_at: string;
  expires_at?: string;
}

function NotificationCenter() {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [allNotifications, setAllNotifications] = useState<EnhancedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [selectedNotification, setSelectedNotification] = useState<EnhancedNotification | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Handle real-time notification updates
  const handleNotificationUpdate = useCallback((updatedNotifications: EnhancedNotification[]) => {
    setAllNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.is_read).length);
    setLastFetchTime(new Date());
    
    // Filter notifications based on active tab
    filterNotificationsByTab(updatedNotifications, activeTab);
  }, [activeTab]);

  // Filter notifications by tab
  const filterNotificationsByTab = useCallback((allNotifs: EnhancedNotification[], tab: string) => {
    let filtered = allNotifs;
    
    switch (tab) {
      case 'unread':
        filtered = allNotifs.filter(n => !n.is_read);
        break;
      case 'orders':
        filtered = allNotifs.filter(n => n.type === 'order');
        break;
      case 'system':
        filtered = allNotifs.filter(n => n.type === 'system');
        break;
      case 'promotions':
        filtered = allNotifs.filter(n => n.type === 'promotion');
        break;
      default:
        filtered = allNotifs;
    }
    
    setNotifications(filtered);
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      const result = await NotificationService.getUserNotifications(user.ID, {
        pageNo: 1,
        pageSize: 50
      });
      
      handleNotificationUpdate(result.notifications);
      
      toast({
        title: 'Notifications refreshed',
        description: `Updated ${result.notifications.length} notifications`
      });
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh notifications',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, handleNotificationUpdate, toast]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (user) {
      // Subscribe to real-time updates
      const unsubscribe = NotificationService.subscribe(user.ID, handleNotificationUpdate);
      unsubscribeRef.current = unsubscribe;
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [user, handleNotificationUpdate]);

  // Handle tab changes
  useEffect(() => {
    filterNotificationsByTab(allNotifications, activeTab);
  }, [activeTab, allNotifications, filterNotificationsByTab]);

  const markAsRead = async (notificationId: string | number) => {
    if (!user) return;
    
    try {
      // Convert to number for ezsite API if it's a string number
      const id = typeof notificationId === 'string' ? 
        (isNaN(Number(notificationId)) ? notificationId : Number(notificationId)) : 
        notificationId;
      
      await NotificationService.markAsRead(id as number, user.ID);

      // Update both notifications arrays
      setNotifications((prev) =>
        prev.map((n) => {
          const currentId = n.ID || n.id;
          return currentId == notificationId ? { ...n, is_read: true } : n; // Use == for loose comparison
        })
      );
      
      setAllNotifications((prev) =>
        prev.map((n) => {
          const currentId = n.ID || n.id;
          return currentId == notificationId ? { ...n, is_read: true } : n; // Use == for loose comparison
        })
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      toast({
        title: 'Success',
        description: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const deleteNotification = async (notificationId: string | number) => {
    if (!user) return;
    try {
      // The service now expects a numeric ID and handles the refresh internally.
      await NotificationService.deleteNotification(notificationId, user.ID);
      toast({
        title: 'Success',
        description: 'Notification deleted.',
      });
      // The real-time listener will handle the UI update automatically.
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete notification. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setIsMarkingAllRead(true);

    const unreadCountBefore = allNotifications.filter(n => !n.is_read).length;
    if (unreadCountBefore === 0) {
      toast({
        title: 'No Unread Notifications',
        description: 'All notifications have already been read.',
      });
      setIsMarkingAllRead(false);
      return;
    }

    try {
      const result = await NotificationService.markAllAsRead(user.ID);
      // The service's real-time listener will automatically update the UI.
      if (result.failures && result.failures > 0) {
        toast({
          title: 'Partial Success',
          description: result.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: result.message || `Marked all ${result.successfulUpdates} notifications as read.`,
        });
      }
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Enhanced notification styling and icons
  const getNotificationIcon = (type: string, priority?: string) => {
    if (priority === 'urgent') return '🚨';
    if (priority === 'high') return '⚡';
    
    switch (type) {
      case 'order':
        return '🛒';
      case 'campaign':
        return '📢';
      case 'promotion':
        return '🎉';
      case 'system':
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string, priority?: string) => {
    if (priority === 'urgent') return 'bg-red-500';
    if (priority === 'high') return 'bg-orange-500';
    
    switch (type) {
      case 'order':
        return 'bg-blue-500';
      case 'campaign':
        return 'bg-purple-500';
      case 'promotion':
        return 'bg-green-500';
      case 'system':
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">URGENT</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">HIGH</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">LOW</Badge>;
      default:
        return null;
    }
  };

  const getMetadata = (metadataString: string) => {
    try {
      return JSON.parse(metadataString || '{}');
    } catch {
      return {};
    }
  };

  const handleNotificationClick = (notification: EnhancedNotification) => {
    // Show the full notification modal
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
    
    // Mark as read if not already
    if (!notification.is_read) {
      const notificationId = notification.ID || notification.id;
      if (notificationId) {
        markAsRead(notificationId);
      }
    }
  };

  const handleViewFullMessage = (notification: EnhancedNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTabCounts = () => {
    return {
      all: allNotifications.length,
      unread: allNotifications.filter(n => !n.is_read).length,
      orders: allNotifications.filter(n => n.type === 'order').length,
      system: allNotifications.filter(n => n.type === 'system').length,
      promotions: allNotifications.filter(n => n.type === 'promotion').length
    };
  };

  if (!user) return null;

  const tabCounts = getTabCounts();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" />
                  Last updated: {formatTime(lastFetchTime.toISOString())}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 w-8 p-0">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-8"
                    disabled={isMarkingAllRead}
                  >
                    {isMarkingAllRead ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCheck className="h-4 w-4 mr-1" />
                    )}
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
                <TabsTrigger value="all" className="text-xs">
                  All ({tabCounts.all})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread ({tabCounts.unread})
                </TabsTrigger>
                <TabsTrigger value="orders" className="text-xs">
                  Orders ({tabCounts.orders})
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs">
                  System ({tabCounts.system})
                </TabsTrigger>
                <TabsTrigger value="promotions" className="text-xs">
                  Promos ({tabCounts.promotions})
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-96">
                <TabsContent value={activeTab} className="mt-0">
                  {isLoading || isRefreshing ? (
                    <div className="p-6 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      {isRefreshing ? 'Refreshing...' : 'Loading notifications...'}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications in this category</p>
                      <p className="text-xs mt-1">Check back later for updates</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {notifications.map((notification, index) => {
                        const metadata = getMetadata(notification.metadata);
                        const priority = metadata.priority || 'normal';
                        const hasAction = Boolean(metadata.actionUrl);
                        const notificationId = notification.ID || notification.id;
                        
                        return (
                          <div key={notificationId || index}>
                            <div
                              className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                                !notification.is_read 
                                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                                  : ''
                              } ${priority === 'urgent' ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm ${getNotificationColor(notification.type, priority)} shadow-sm`}>
                                  {getNotificationIcon(notification.type, priority)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className={`font-medium text-sm ${
                                          !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                        }`}>
                                          {notification.title}
                                        </p>
                                        {getPriorityBadge(priority)}
                                        {hasAction && (
                                          <ExternalLink className="h-3 w-3 text-blue-500" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center justify-between mt-3">
                                        <p className="text-xs text-gray-500">
                                          {formatTime(notification.sent_at || notification.created_at)}
                                        </p>
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-xs">
                                            {notification.type}
                                          </Badge>
                                          {notification.channel !== 'in_app' && (
                                            <Badge variant="secondary" className="text-xs">
                                              {notification.channel}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e) => handleViewFullMessage(notification, e)}
                                          className="cursor-pointer">
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          View full message
                                        </DropdownMenuItem>
                                        {!notification.is_read && notificationId && (
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              markAsRead(notificationId);
                                            }}
                                            className="cursor-pointer">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Mark as read
                                          </DropdownMenuItem>
                                        )}
                                        {hasAction && (
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(metadata.actionUrl, '_blank');
                                            }}
                                            className="cursor-pointer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Open link
                                          </DropdownMenuItem>
                                        )}
                                        {notificationId && (
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteNotification(notificationId);
                                            }}
                                            className="cursor-pointer text-red-600">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {index < notifications.length - 1 && <Separator />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
      
      {/* Full Notification Modal */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && (
                <>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getNotificationColor(selectedNotification.type, getMetadata(selectedNotification.metadata).priority)} shadow-sm`}>
                    {getNotificationIcon(selectedNotification.type, getMetadata(selectedNotification.metadata).priority)}
                  </div>
                  {selectedNotification.title}
                  {getPriorityBadge(getMetadata(selectedNotification.metadata).priority)}
                </>
              )}
            </DialogTitle>
            {selectedNotification && (
              <DialogDescription asChild>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Type: {selectedNotification.type}</span>
                  <span>Channel: {selectedNotification.channel}</span>
                  <span>Status: {selectedNotification.is_read ? 'Read' : 'Unread'}</span>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <Separator />
              
              {/* Message Content */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Message</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>
              </div>
              
              {/* Metadata */}
              {selectedNotification.metadata && selectedNotification.metadata !== '{}' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Additional Information</h4>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    {(() => {
                      const metadata = getMetadata(selectedNotification.metadata);
                      return (
                        <div className="space-y-2">
                          {metadata.orderId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order ID:</span>
                              <span className="font-medium">{metadata.orderId}</span>
                            </div>
                          )}
                          {metadata.customerId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Customer ID:</span>
                              <span className="font-medium">{metadata.customerId}</span>
                            </div>
                          )}
                          {metadata.orderTotal && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order Total:</span>
                              <span className="font-medium">${metadata.orderTotal.toFixed(2)}</span>
                            </div>
                          )}
                          {metadata.paymentMethod && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="font-medium">{metadata.paymentMethod}</span>
                            </div>
                          )}
                          {metadata.actionUrl && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Action:</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(metadata.actionUrl, '_blank')}
                                className="text-blue-600"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open Link
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {/* Timestamps */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Timestamps</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">{formatFullDateTime(selectedNotification.created_at)}</p>
                  </div>
                  {selectedNotification.sent_at && (
                    <div>
                      <span className="text-gray-600">Sent:</span>
                      <p className="font-medium">{formatFullDateTime(selectedNotification.sent_at)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {!selectedNotification.is_read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const notificationId = selectedNotification.ID || selectedNotification.id;
                      if (notificationId) {
                        markAsRead(notificationId);
                        setSelectedNotification(prev => prev ? { ...prev, is_read: true } : null);
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const notificationId = selectedNotification.ID || selectedNotification.id;
                    if (notificationId) {
                      deleteNotification(notificationId);
                      setIsNotificationModalOpen(false);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="ml-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Popover>
  );
}

export default NotificationCenter;
