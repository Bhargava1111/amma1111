import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Settings, Save, TestTube, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { PushNotificationService } from '../services/PushNotificationService';

interface NotificationPreferences {
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  marketing_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    orders: boolean;
    promotions: boolean;
    system: boolean;
    campaigns: boolean;
  };
  notification_timing: {
    instant: boolean;
    daily_summary: boolean;
    weekly_summary: boolean;
  };
}

interface PushNotificationStatus {
  hasSubscription: boolean;
  isEnabled: boolean;
  vapidPublicKey: string;
}

function NotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    whatsapp_notifications: false,
    marketing_notifications: true,
    push_notifications: false,
    notification_types: {
      orders: true,
      promotions: true,
      system: true,
      campaigns: false
    },
    notification_timing: {
      instant: true,
      daily_summary: false,
      weekly_summary: false
    }
  });
  const [pushStatus, setPushStatus] = useState<PushNotificationStatus>({
    hasSubscription: false,
    isEnabled: false,
    vapidPublicKey: ''
  });

  // Load current preferences
  useEffect(() => {
    loadPreferences();
    checkPushNotificationStatus();
  }, [user]);

  // Initialize push notification service
  useEffect(() => {
    PushNotificationService.initialize();
  }, []);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await window.ezsite.apis.tablePage('10411', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_id', op: 'Equal', value: user.ID }]
      });

      if (result.data && result.data.List && result.data.List.length > 0) {
        const userProfile = result.data.List[0];
        setPreferences(prev => ({
          ...prev,
          email_notifications: userProfile.email_notifications ?? true,
          whatsapp_notifications: userProfile.whatsapp_notifications ?? false,
          marketing_notifications: userProfile.marketing_notifications ?? true,
          push_notifications: userProfile.push_notifications ?? false
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPushNotificationStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/push-notifications/status?userId=${user.ID}`);
      if (response.ok) {
        const data = await response.json();
        setPushStatus(data.data);
      }
    } catch (error) {
      console.error('Error checking push notification status:', error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.ID,
          preferences: {
            email_notifications: preferences.email_notifications,
            whatsapp_notifications: preferences.whatsapp_notifications,
            marketing_notifications: preferences.marketing_notifications,
            push_notifications: preferences.push_notifications
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences saved successfully'
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePushNotifications = async (enabled: boolean) => {
    if (!user) return;

    try {
      if (enabled) {
        // Subscribe to push notifications
        await PushNotificationService.subscribe(user.ID);
        setPushStatus(prev => ({ ...prev, hasSubscription: true, isEnabled: true }));
      } else {
        // Unsubscribe from push notifications
        await PushNotificationService.unsubscribe();
        await fetch('/api/push-notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.ID })
        });
        setPushStatus(prev => ({ ...prev, hasSubscription: false, isEnabled: false }));
      }

      setPreferences(prev => ({
        ...prev,
        push_notifications: enabled
      }));

      toast({
        title: enabled ? 'Push Notifications Enabled' : 'Push Notifications Disabled',
        description: enabled 
          ? 'You will now receive push notifications' 
          : 'Push notifications have been disabled'
      });
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update push notification settings',
        variant: 'destructive'
      });
    }
  };

  const testPushNotification = async () => {
    if (!user) return;

    setTesting(true);
    try {
      await PushNotificationService.testNotification();
      toast({
        title: 'Test Notification Sent',
        description: 'Check your browser for the test notification'
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTypeChange = (type: keyof NotificationPreferences['notification_types'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: value
      }
    }));
  };

  const handleTimingChange = (timing: keyof NotificationPreferences['notification_timing'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notification_timing: {
        ...prev.notification_timing,
        [timing]: value
      }
    }));
  };

  const getPushStatusBadge = () => {
    const permission = PushNotificationService.getPermissionStatus();
    
    if (permission === 'granted' && pushStatus.hasSubscription) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>;
    } else if (permission === 'denied') {
      return <Badge variant="destructive">Blocked</Badge>;
    } else if (permission === 'default') {
      return <Badge variant="outline">Not Configured</Badge>;
    } else {
      return <Badge variant="secondary">Disabled</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-gray-600">Manage how you receive notifications from MANAfoods</p>
        </div>
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('email_notifications', checked)}
            />
          </div>

          <Separator />

          {/* WhatsApp Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <Label htmlFor="whatsapp-notifications" className="text-sm font-medium">
                  WhatsApp Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications via WhatsApp
                </p>
              </div>
            </div>
            <Switch
              id="whatsapp-notifications"
              checked={preferences.whatsapp_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('whatsapp_notifications', checked)}
            />
          </div>

          <Separator />

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Push Notifications
                  {getPushStatusBadge()}
                </Label>
                <p className="text-sm text-gray-500">
                  Receive browser push notifications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testPushNotification}
                disabled={testing || !pushStatus.hasSubscription}
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4" />
                    Test
                  </>
                )}
              </Button>
              <Switch
                id="push-notifications"
                checked={preferences.push_notifications}
                onCheckedChange={togglePushNotifications}
                disabled={!PushNotificationService.isNotificationSupported()}
              />
            </div>
          </div>

          <Separator />

          {/* Marketing Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-500" />
              <div>
                <Label htmlFor="marketing-notifications" className="text-sm font-medium">
                  Marketing Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive promotional offers and updates
                </p>
              </div>
            </div>
            <Switch
              id="marketing-notifications"
              checked={preferences.marketing_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('marketing_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="orders" className="text-sm font-medium">
                🛒 Order Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Order confirmations, shipping updates, and delivery notifications
              </p>
            </div>
            <Switch
              id="orders"
              checked={preferences.notification_types.orders}
              onCheckedChange={(checked) => handleTypeChange('orders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotions" className="text-sm font-medium">
                🎉 Promotions
              </Label>
              <p className="text-sm text-gray-500">
                Special offers, discounts, and seasonal promotions
              </p>
            </div>
            <Switch
              id="promotions"
              checked={preferences.notification_types.promotions}
              onCheckedChange={(checked) => handleTypeChange('promotions', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system" className="text-sm font-medium">
                🔔 System Notifications
              </Label>
              <p className="text-sm text-gray-500">
                System updates, maintenance notices, and important announcements
              </p>
            </div>
            <Switch
              id="system"
              checked={preferences.notification_types.system}
              onCheckedChange={(checked) => handleTypeChange('system', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="campaigns" className="text-sm font-medium">
                📢 Campaign Updates
              </Label>
              <p className="text-sm text-gray-500">
                Marketing campaigns and product announcements
              </p>
            </div>
            <Switch
              id="campaigns"
              checked={preferences.notification_types.campaigns}
              onCheckedChange={(checked) => handleTypeChange('campaigns', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Timing</CardTitle>
          <CardDescription>
            Choose when you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="instant" className="text-sm font-medium">
                ⚡ Instant Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive notifications immediately as they happen
              </p>
            </div>
            <Switch
              id="instant"
              checked={preferences.notification_timing.instant}
              onCheckedChange={(checked) => handleTimingChange('instant', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="daily-summary" className="text-sm font-medium">
                📅 Daily Summary
              </Label>
              <p className="text-sm text-gray-500">
                Receive a daily summary of all notifications
              </p>
            </div>
            <Switch
              id="daily-summary"
              checked={preferences.notification_timing.daily_summary}
              onCheckedChange={(checked) => handleTimingChange('daily_summary', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-summary" className="text-sm font-medium">
                📊 Weekly Summary
              </Label>
              <p className="text-sm text-gray-500">
                Receive a weekly summary of notifications and activity
              </p>
            </div>
            <Switch
              id="weekly-summary"
              checked={preferences.notification_timing.weekly_summary}
              onCheckedChange={(checked) => handleTimingChange('weekly_summary', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Browser Support Info */}
      {!PushNotificationService.isNotificationSupported() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <Bell className="h-5 w-5" />
              <p className="text-sm">
                Push notifications are not supported in your current browser. 
                Please use a modern browser like Chrome, Firefox, or Safari for the best experience.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NotificationPreferences; 