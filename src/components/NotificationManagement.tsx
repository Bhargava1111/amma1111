import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Send, Loader2, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// Define Notification interface based on NOTIFICATIONS_TABLE_ID structure
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'system' | 'order' | 'campaign' | 'promotion';
  channel: 'in_app' | 'email' | 'whatsapp';
  status: 'sent' | 'read' | 'failed';
  created_at: string;
  sent_at: string;
}

const NOTIFICATIONS_TABLE_ID = '10412'; // From OrderService.ts and AuthContext.tsx

interface NotificationManagementProps {}

const NotificationManagement: React.FC<NotificationManagementProps> = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] = useState(false);
  const [isViewNotificationModalOpen, setIsViewNotificationModalOpen] = useState(false);
  const [currentViewingNotification, setCurrentViewingNotification] = useState<Notification | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [filterType, setFilterType] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');

  const [newNotificationData, setNewNotificationData] = useState({
    user_id: '', // Can be empty for all users, or a specific user ID
    title: '',
    message: '',
    type: 'system' as Notification['type'],
    channel: 'in_app' as Notification['channel'],
  });

  useEffect(() => {
    fetchNotifications();
  }, [page, filterType, filterChannel]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any[] = [];
      if (filterType !== 'all') {
        filters.push({ name: 'type', op: 'Equal', value: filterType });
      }
      if (filterChannel !== 'all') {
        filters.push({ name: 'channel', op: 'Equal', value: filterChannel });
      }

      console.log(`NotificationManagement: Fetching notifications from table ${NOTIFICATIONS_TABLE_ID} with filters:`, filters);
      const { data, error } = await window.ezsite.apis.tablePage(NOTIFICATIONS_TABLE_ID, {
        PageNo: page,
        PageSize: pageSize,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) {
        console.error('NotificationManagement: Error fetching notifications:', error);
        throw new Error(error);
      }
      console.log('NotificationManagement: Successfully fetched notifications:', data);
      setNotifications(data?.List || []);
      setTotalPages(Math.ceil((data?.VirtualCount || 0) / pageSize));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch notifications.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotificationClick = () => {
    setNewNotificationData({
      user_id: '',
      title: '',
      message: '',
      type: 'system',
      channel: 'in_app',
    });
    setIsSendNotificationModalOpen(true);
  };

  const handleNewNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewNotificationData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNewNotificationSelectChange = (value: string, id: string) => {
    setNewNotificationData((prev) => ({ ...prev, [id]: value as any }));
  };

  const handleSendNotification = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: newNotificationData.user_id || 'all', // 'all' for broadcast
        title: newNotificationData.title,
        message: newNotificationData.message,
        type: newNotificationData.type,
        channel: newNotificationData.channel,
        status: 'sent',
        created_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
      };

      console.log(`NotificationManagement: Sending notification to table ${NOTIFICATIONS_TABLE_ID} with payload:`, payload);
      const { error } = await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, payload);
      if (error) {
        console.error('NotificationManagement: Error sending notification:', error);
        throw new Error(error);
      }
      console.log('NotificationManagement: Notification successfully recorded in database.');

      // If sending email/whatsapp, might need separate API calls
      if (newNotificationData.channel === 'email') {
        console.log('NotificationManagement: Attempting to send email notification.');
        await window.ezsite.apis.sendEmail({
          from: 'admin@example.com',
          to: payload.user_id === 'all' ? ['all_users@example.com'] : [payload.user_id], // Placeholder for actual user email
          subject: payload.title,
          html: `<p>${payload.message}</p>`
        });
        console.log('NotificationManagement: Email notification sent successfully (if API is configured).');
      }
      // Add logic for WhatsApp if applicable
      // console.log('NotificationManagement: Attempting to send WhatsApp notification.');
      // await window.ezsite.apis.sendWhatsApp({ ... });

      toast({
        title: 'Success',
        description: 'Notification sent successfully.',
        variant: 'default'
      });
      setIsSendNotificationModalOpen(false);
      fetchNotifications();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send notification.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotificationClick = (notification: Notification) => {
    setCurrentViewingNotification(notification);
    setIsViewNotificationModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Management
        </CardTitle>
        <CardDescription>Manage system notifications and user communications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSendNotificationClick}>
            <Plus className="h-4 w-4 mr-2" /> Send New Notification
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button onClick={fetchNotifications} className="mt-4">Retry</Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No notifications found.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>{notification.user_id === 'all' ? 'All Users' : notification.user_id}</TableCell>
                    <TableCell>{notification.type}</TableCell>
                    <TableCell>{notification.channel}</TableCell>
                    <TableCell>{notification.status}</TableCell>
                    <TableCell>
                      {notification.sent_at ? (
                        <div>
                          <div>{format(new Date(notification.sent_at), 'MMM d, yyyy, h:mm a')}</div>
                          <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewNotificationClick(notification)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Send New Notification Modal */}
      <Dialog open={isSendNotificationModalOpen} onOpenChange={setIsSendNotificationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send New Notification</DialogTitle>
            <CardDescription>Compose and send a new notification to users.</CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newNotificationData.title}
                onChange={handleNewNotificationChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                value={newNotificationData.message}
                onChange={handleNewNotificationChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_id" className="text-right">
                Recipient (User ID)
              </Label>
              <Input
                id="user_id"
                placeholder="Leave empty for all users"
                value={newNotificationData.user_id}
                onChange={handleNewNotificationChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={newNotificationData.type} onValueChange={(value) => handleNewNotificationSelectChange(value, 'type')}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel" className="text-right">
                Channel
              </Label>
              <Select value={newNotificationData.channel} onValueChange={(value) => handleNewNotificationSelectChange(value, 'channel')}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendNotificationModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4 mr-2" /> Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Notification Details Modal */}
      <Dialog open={isViewNotificationModalOpen} onOpenChange={setIsViewNotificationModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <CardDescription>Details of the selected notification.</CardDescription>
          </DialogHeader>
          {currentViewingNotification && (
            <div className="grid gap-4 py-4">
              <p><strong>Title:</strong> {currentViewingNotification.title}</p>
              <p><strong>Message:</strong> {currentViewingNotification.message}</p>
              <p><strong>Recipient:</strong> {currentViewingNotification.user_id === 'all' ? 'All Users' : currentViewingNotification.user_id}</p>
              <p><strong>Type:</strong> {currentViewingNotification.type}</p>
              <p><strong>Channel:</strong> {currentViewingNotification.channel}</p>
              <p><strong>Status:</strong> {currentViewingNotification.status}</p>
              <p><strong>Created At:</strong> {new Date(currentViewingNotification.created_at).toLocaleString()}</p>
              <p><strong>Sent At:</strong> {new Date(currentViewingNotification.sent_at).toLocaleString()}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewNotificationModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NotificationManagement;
