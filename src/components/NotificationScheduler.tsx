import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Send, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Users,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'promotion' | 'campaign';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: string[];
  targetUsers: string[];
  scheduledAt: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
    maxOccurrences?: number;
  };
  createdAt: string;
  createdBy: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'promotion' | 'campaign';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: string[];
}

function NotificationScheduler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState<ScheduledNotification | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system' as const,
    priority: 'normal' as const,
    channels: ['in_app'],
    targetUsers: [],
    scheduledAt: '',
    isRecurring: false,
    recurringPattern: {
      frequency: 'daily' as const,
      endDate: '',
      maxOccurrences: 1
    }
  });

  useEffect(() => {
    loadScheduledNotifications();
    loadTemplates();
  }, []);

  const loadScheduledNotifications = async () => {
    setLoading(true);
    try {
      // Simulate loading scheduled notifications
      const mockScheduled: ScheduledNotification[] = [
        {
          id: '1',
          title: 'Weekly Newsletter',
          message: 'Check out our latest pickle varieties and special offers!',
          type: 'campaign',
          priority: 'normal',
          channels: ['email', 'whatsapp'],
          targetUsers: ['all'],
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          isRecurring: true,
          recurringPattern: {
            frequency: 'weekly',
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          createdAt: new Date().toISOString(),
          createdBy: 'Admin'
        },
        {
          id: '2',
          title: 'Flash Sale Alert',
          message: '24-hour flash sale! 30% off all pickle varieties. Limited time only!',
          type: 'promotion',
          priority: 'high',
          channels: ['push', 'email', 'whatsapp'],
          targetUsers: ['all'],
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          isRecurring: false,
          createdAt: new Date().toISOString(),
          createdBy: 'Admin'
        }
      ];
      setScheduledNotifications(mockScheduled);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const mockTemplates: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Order Confirmation',
          title: 'Order Confirmed',
          message: 'Your order has been confirmed and is being processed.',
          type: 'order',
          priority: 'normal',
          channels: ['email', 'whatsapp']
        },
        {
          id: '2',
          name: 'Promotional Offer',
          title: 'Special Offer Just for You!',
          message: 'Enjoy exclusive discounts on our premium pickle collection.',
          type: 'promotion',
          priority: 'normal',
          channels: ['push', 'email']
        },
        {
          id: '3',
          name: 'System Maintenance',
          title: 'Scheduled Maintenance Notice',
          message: 'Our system will be under maintenance from 2 AM to 4 AM IST.',
          type: 'system',
          priority: 'high',
          channels: ['in_app', 'email']
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const createScheduledNotification = async () => {
    if (!formData.title || !formData.message || !formData.scheduledAt) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          channels: formData.channels,
          userIds: formData.targetUsers.length > 0 ? formData.targetUsers : ['all'],
          scheduleAt: formData.scheduledAt,
          metadata: {
            isRecurring: formData.isRecurring,
            recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification scheduled successfully'
        });
        setShowCreateDialog(false);
        resetForm();
        loadScheduledNotifications();
      } else {
        throw new Error('Failed to schedule notification');
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule notification',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelScheduledNotification = async (notificationId: string) => {
    try {
      // Simulate cancellation
      setScheduledNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'cancelled' as const }
            : n
        )
      );
      
      toast({
        title: 'Success',
        description: 'Scheduled notification cancelled'
      });
    } catch (error) {
      console.error('Error cancelling notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel notification',
        variant: 'destructive'
      });
    }
  };

  const rescheduleNotification = async (notificationId: string, newDateTime: string) => {
    try {
      setScheduledNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, scheduledAt: newDateTime }
            : n
        )
      );
      
      toast({
        title: 'Success',
        description: 'Notification rescheduled successfully'
      });
    } catch (error) {
      console.error('Error rescheduling notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule notification',
        variant: 'destructive'
      });
    }
  };

  const useTemplate = (template: NotificationTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type as any,
      priority: template.priority as any,
      channels: template.channels
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'system',
      priority: 'normal',
      channels: ['in_app'],
      targetUsers: [],
      scheduledAt: '',
      isRecurring: false,
      recurringPattern: {
        frequency: 'daily',
        endDate: '',
        maxOccurrences: 1
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛒';
      case 'system': return '🔔';
      case 'promotion': return '🎉';
      case 'campaign': return '📢';
      default: return '💬';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeUntilScheduled = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Scheduler</h2>
          <p className="text-gray-600">Schedule and manage delayed notifications</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Notification</DialogTitle>
              <DialogDescription>
                Create a notification to be sent at a specific time
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Templates */}
              <div>
                <Label>Use Template (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => useTemplate(template)}
                      className="text-left justify-start"
                    >
                      <span className="mr-1">{getTypeIcon(template.type)}</span>
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled-at">Scheduled Time *</Label>
                  <Input
                    id="scheduled-at"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">🛒 Order</SelectItem>
                      <SelectItem value="system">🔔 System</SelectItem>
                      <SelectItem value="promotion">🎉 Promotion</SelectItem>
                      <SelectItem value="campaign">📢 Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Channels */}
              <div>
                <Label>Delivery Channels</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['in_app', 'email', 'whatsapp', 'push'].map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Switch
                        id={channel}
                        checked={formData.channels.includes(channel)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              channels: [...prev.channels, channel]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              channels: prev.channels.filter(c => c !== channel)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={channel} className="text-sm capitalize">
                        {channel.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring Options */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                />
                <Label htmlFor="recurring">Recurring Notification</Label>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.recurringPattern.frequency}
                      onValueChange={(value: any) => setFormData(prev => ({
                        ...prev,
                        recurringPattern: { ...prev.recurringPattern, frequency: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.recurringPattern.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurringPattern: { ...prev.recurringPattern, endDate: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-occurrences">Max Occurrences</Label>
                    <Input
                      id="max-occurrences"
                      type="number"
                      value={formData.recurringPattern.maxOccurrences}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurringPattern: { ...prev.recurringPattern, maxOccurrences: parseInt(e.target.value) }
                      }))}
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createScheduledNotification} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Notifications</CardTitle>
          <CardDescription>
            Manage your scheduled and recurring notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading scheduled notifications...</span>
              </div>
            ) : scheduledNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled notifications yet</p>
                <p className="text-sm">Create your first scheduled notification to get started</p>
              </div>
            ) : (
              scheduledNotifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getTypeIcon(notification.type)}</span>
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority}
                      </Badge>
                      {notification.isRecurring && (
                        <Badge variant="outline">
                          {notification.recurringPattern?.frequency}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(notification.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {notification.targetUsers.length} users
                      </span>
                      <span>
                        Channels: {notification.channels.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.status === 'scheduled' && (
                        <span className="text-blue-600 font-medium">
                          In {getTimeUntilScheduled(notification.scheduledAt)}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDateTime = prompt('Enter new date and time:', notification.scheduledAt);
                            if (newDateTime) {
                              rescheduleNotification(notification.id, newDateTime);
                            }
                          }}
                          disabled={notification.status !== 'scheduled'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelScheduledNotification(notification.id)}
                          disabled={notification.status !== 'scheduled'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationScheduler; 