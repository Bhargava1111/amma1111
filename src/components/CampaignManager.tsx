import React, { useState, useEffect } from 'react';
import { Plus, Send, Edit, Trash2, Users, Mail, MessageSquare, BarChart3, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface Campaign {
  ID: number;
  name: string;
  description: string;
  type: string;
  status: string;
  subject: string;
  content: string;
  target_audience: string;
  scheduled_at: string;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  ID: number;
  user_id: string;
  phone_number: string;
  full_name: string;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  marketing_notifications: boolean;
  auth_method: string;
}

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    subject: '',
    content: '',
    target_audience: '{}',
    scheduled_at: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
    loadUserProfiles();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(10413, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'ID',
        IsAsc: false
      });

      if (!error && data?.List) {
        setCampaigns(data.List);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfiles = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(10411, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false
      });

      if (!error && data?.List) {
        setUserProfiles(data.List);
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const campaignData = {
        ...formData,
        created_by: user.ID,
        status: 'draft',
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingCampaign) {
        const { error } = await window.ezsite.apis.tableUpdate(10413, {
          ID: editingCampaign.ID,
          ...campaignData
        });
        if (error) throw new Error(error);
      } else {
        const { error } = await window.ezsite.apis.tableCreate(10413, campaignData);
        if (error) throw new Error(error);
      }

      toast({
        title: 'Success',
        description: `Campaign ${editingCampaign ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForm();
      loadCampaigns();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save campaign',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'email',
      subject: '',
      content: '',
      target_audience: '{}',
      scheduled_at: ''
    });
    setEditingCampaign(null);
  };

  const editCampaign = (campaign: Campaign) => {
    setFormData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      subject: campaign.subject,
      content: campaign.content,
      target_audience: campaign.target_audience,
      scheduled_at: campaign.scheduled_at
    });
    setEditingCampaign(campaign);
    setDialogOpen(true);
  };

  const deleteCampaign = async (campaignId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableDelete(10413, { ID: campaignId });
      if (error) throw new Error(error);

      toast({
        title: 'Success',
        description: 'Campaign deleted successfully'
      });
      loadCampaigns();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive'
      });
    }
  };

  const sendCampaign = async (campaign: Campaign) => {
    setIsLoading(true);
    try {
      // Filter target audience based on campaign type and preferences
      let targetUsers = userProfiles;

      if (campaign.type === 'email') {
        targetUsers = userProfiles.filter((profile) => profile.email_notifications);
      } else if (campaign.type === 'whatsapp') {
        targetUsers = userProfiles.filter((profile) =>
        profile.whatsapp_notifications && profile.phone_number
        );
      }

      // Only send to users who want marketing notifications
      targetUsers = targetUsers.filter((profile) => profile.marketing_notifications);

      let sentCount = 0;
      let deliveredCount = 0;

      // Send notifications to each target user
      for (const profile of targetUsers) {
        try {
          // Create notification record
          await window.ezsite.apis.tableCreate(10412, {
            user_id: profile.user_id,
            title: campaign.subject,
            message: campaign.content,
            type: 'campaign',
            channel: campaign.type === 'email' ? 'email' : 'whatsapp',
            status: 'sent',
            campaign_id: campaign.ID.toString(),
            created_at: new Date().toISOString(),
            sent_at: new Date().toISOString()
          });

          sentCount++;

          // For email campaigns, send actual emails
          if (campaign.type === 'email') {
            try {
              await window.ezsite.apis.sendEmail({
                from: 'support@ezsite.ai',
                to: [`${profile.user_id}@example.com`], // In real app, get actual email
                subject: campaign.subject,
                html: campaign.content
              });
              deliveredCount++;
            } catch (emailError) {
              console.error('Error sending email:', emailError);
            }
          }

          // For WhatsApp campaigns, create WhatsApp integration record
          if (campaign.type === 'whatsapp' && profile.phone_number) {
            try {
              await window.ezsite.apis.tableCreate(10414, {
                phone_number: profile.phone_number,
                message_content: campaign.content,
                message_type: 'text',
                status: 'sent',
                user_id: profile.user_id,
                campaign_id: campaign.ID.toString(),
                sent_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              });
              deliveredCount++;
            } catch (whatsappError) {
              console.error('Error creating WhatsApp record:', whatsappError);
            }
          }
        } catch (error) {
          console.error('Error sending to user:', profile.user_id, error);
        }
      }

      // Update campaign statistics
      await window.ezsite.apis.tableUpdate(10413, {
        ID: campaign.ID,
        status: 'completed',
        sent_count: sentCount,
        delivered_count: deliveredCount
      });

      toast({
        title: 'Success',
        description: `Campaign sent to ${sentCount} users, ${deliveredCount} delivered successfully`
      });

      loadCampaigns();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send campaign',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      scheduled: 'outline',
      active: 'default',
      completed: 'default',
      paused: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getEngagementRate = (campaign: Campaign) => {
    if (campaign.sent_count === 0) return 0;
    return Math.round(campaign.opened_count / campaign.sent_count * 100);
  };

  const getTotalUsers = () => userProfiles.length;
  const getEmailUsers = () => userProfiles.filter((p) => p.email_notifications && p.marketing_notifications).length;
  const getWhatsAppUsers = () => userProfiles.filter((p) => p.whatsapp_notifications && p.marketing_notifications && p.phone_number).length;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campaign Manager</h2>
          <p className="text-gray-600">Create and manage marketing campaigns</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </DialogTitle>
              <DialogDescription>
                Create engaging campaigns to reach your customers
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Summer Sale 2024"
                    required />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}>

                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Campaign description and goals" />

              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject/Title</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="🎉 Summer Sale - Up to 50% Off!"
                  required />

              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Your campaign message..."
                  rows={6}
                  required />

              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Schedule (Optional)</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })} />

              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingCampaign ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {isLoading ?
          <div className="text-center py-8">Loading campaigns...</div> :
          campaigns.length === 0 ?
          <Card>
              <CardContent className="py-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first campaign to engage with customers</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card> :

          <div className="grid gap-4">
              {campaigns.map((campaign) =>
            <Card key={campaign.ID}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {campaign.type === 'email' ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                          {campaign.name}
                        </CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(campaign.status)}
                        <div className="flex gap-1">
                          <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editCampaign(campaign)}>

                            <Edit className="h-4 w-4" />
                          </Button>
                          {campaign.status === 'draft' &&
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendCampaign(campaign)}
                        disabled={isLoading}>

                              <Send className="h-4 w-4" />
                            </Button>
                      }
                          <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCampaign(campaign.ID)}>

                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Sent</p>
                        <p className="text-2xl font-bold">{campaign.sent_count}</p>
                      </div>
                      <div>
                        <p className="font-medium">Delivered</p>
                        <p className="text-2xl font-bold">{campaign.delivered_count}</p>
                      </div>
                      <div>
                        <p className="font-medium">Opened</p>
                        <p className="text-2xl font-bold">{campaign.opened_count}</p>
                      </div>
                      <div>
                        <p className="font-medium">Engagement</p>
                        <p className="text-2xl font-bold">{getEngagementRate(campaign)}%</p>
                      </div>
                    </div>
                    {campaign.sent_count > 0 &&
                <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Delivery Rate</span>
                          <span>{Math.round(campaign.delivered_count / campaign.sent_count * 100)}%</span>
                        </div>
                        <Progress
                    value={campaign.delivered_count / campaign.sent_count * 100}
                    className="h-2" />

                      </div>
                }
                  </CardContent>
                </Card>
            )}
            </div>
          }
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-gray-600">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.sent_count, 0)}
                </div>
                <p className="text-xs text-gray-600">Messages sent</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length > 0 ?
                  Math.round(campaigns.reduce((sum, c) => sum + getEngagementRate(c), 0) / campaigns.length) :
                  0}%
                </div>
                <p className="text-xs text-gray-600">Open rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalUsers()}</div>
                <p className="text-xs text-gray-600">Registered users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Reachable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getEmailUsers()}</div>
                <p className="text-xs text-gray-600">Accept email marketing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Reachable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getWhatsAppUsers()}</div>
                <p className="text-xs text-gray-600">Accept WhatsApp marketing</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Overview of user notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Email Notifications</span>
                    <span>{getEmailUsers()}/{getTotalUsers()}</span>
                  </div>
                  <Progress
                    value={getTotalUsers() > 0 ? getEmailUsers() / getTotalUsers() * 100 : 0}
                    className="h-2" />

                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>WhatsApp Notifications</span>
                    <span>{getWhatsAppUsers()}/{getTotalUsers()}</span>
                  </div>
                  <Progress
                    value={getTotalUsers() > 0 ? getWhatsAppUsers() / getTotalUsers() * 100 : 0}
                    className="h-2" />

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

}
