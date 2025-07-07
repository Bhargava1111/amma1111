import React, { useState, useEffect } from 'react';
import { Bell, X, Eye, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductVariant } from '@/types/index';
import { useFieldArray } from 'react-hook-form';

interface Notification {
  ID: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  status: string;
  is_read: boolean;
  campaign_id: string;
  metadata: string;
  sent_at: string;
  created_at: string;
}

function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(10412, {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: [{ name: 'user_id', op: 'Equal', value: user.ID }]
      });

      if (!error && data?.List) {
        setNotifications(data.List);
        setUnreadCount(data.List.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (notificationId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(10412, {
        ID: notificationId,
        is_read: true
      });

      if (!error) {
        setNotifications((prev) =>
        prev.map((n) => n.ID === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableDelete(10412, notificationId);

      if (!error) {
        const notification = notifications.find((n) => n.ID === notificationId);
        setNotifications((prev) => prev.filter((n) => n.ID !== notificationId));
        if (notification && !notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast({
          title: 'Success',
          description: 'Notification deleted'
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.is_read);

    try {
      // Process notifications with proper key tracking
      const updatePromises = unreadNotifications.map((notification) => 
        window.ezsite.apis.tableUpdate(10412, {
          ID: notification.ID,
          is_read: true
        })
      );

      await Promise.all(updatePromises);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'campaign':
        return '📢';
      case 'promotion':
        return '🎉';
      case 'system':
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 &&
          <Badge
            key="unread-badge"
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">

              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 &&
                <Button
                  key="mark-all-read"
                  variant="ghost"
                  size="sm"
                  aria-label="Mark all as read"
                  onClick={markAllAsRead}
                  className="text-xs">

                    Mark all read
                  </Button>
                }
                <Button
                  key="close-notifications"
                  variant="ghost"
                  size="sm"
                  aria-label="Close notifications"
                  onClick={() => setIsOpen(false)}>

                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 &&
            <CardDescription key="unread-count-description">
                You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </CardDescription>
            }
          </CardHeader>
          <Separator />
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div key="loading-state" className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div key="empty-state" className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div key="notifications-list" className="space-y-0">
                {notifications.map((notification, index) => {
                  // Create a unique key that handles undefined IDs
                  const notificationKey = notification.ID ? `notification-${notification.ID}` : `notification-index-${index}`;
                  const separatorKey = notification.ID ? `separator-${notification.ID}` : `separator-index-${index}`;
                  
                  return (
                    <div key={notificationKey}>
                      <div
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={`font-medium text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatTime(notification.sent_at || notification.created_at)}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.is_read && (
                                    <DropdownMenuItem
                                      key={`mark-read-${notificationKey}`}
                                      onClick={() => markAsRead(notification.ID)}
                                      className="cursor-pointer">
                                      <Eye className="h-4 w-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    key={`delete-${notificationKey}`}
                                    onClick={() => deleteNotification(notification.ID)}
                                    className="cursor-pointer text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator key={separatorKey} />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;

