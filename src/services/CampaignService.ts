const CAMPAIGNS_TABLE_ID = '10413';
const NOTIFICATIONS_TABLE_ID = '10412';
const WHATSAPP_TABLE_ID = '10414';
const USER_PROFILES_TABLE_ID = '10411';

export interface Campaign {
  id: number;
  name: string;
  description: string;
  type: 'email' | 'whatsapp' | 'mixed';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
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

export class CampaignService {
  // Create a new campaign
  static async createCampaign(params: {
    name: string;
    description: string;
    type: Campaign['type'];
    subject: string;
    content: string;
    targetAudience: any;
    scheduledAt?: string;
    createdBy: string;
  }) {
    try {
      const {
        name,
        description,
        type,
        subject,
        content,
        targetAudience,
        scheduledAt,
        createdBy
      } = params;

      const campaignData = {
        name,
        description,
        type,
        status: scheduledAt ? 'scheduled' : 'draft',
        subject,
        content,
        target_audience: JSON.stringify(targetAudience),
        scheduled_at: scheduledAt || '',
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableCreate(CAMPAIGNS_TABLE_ID, campaignData);
      if (error) throw new Error(error);

      // Send admin notification
      try {
        await window.ezsite.apis.sendEmail({
          from: 'support@ezsite.ai',
          to: ['admin@company.com'],
          subject: 'New Campaign Created',
          html: `
            <h2>New Campaign Created</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Status:</strong> ${campaignData.status}</p>
            <p><strong>Created by:</strong> ${createdBy}</p>
            <p><strong>Created at:</strong> ${new Date().toLocaleString()}</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending campaign creation email:', emailError);
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Get all campaigns
  static async getCampaigns(params: {
    pageNo?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    createdBy?: string;
  } = {}) {
    try {
      const { pageNo = 1, pageSize = 20, status, type, createdBy } = params;

      const filters: any[] = [];

      if (status && status !== 'all') {
        filters.push({
          name: 'status',
          op: 'Equal',
          value: status
        });
      }

      if (type && type !== 'all') {
        filters.push({
          name: 'type',
          op: 'Equal',
          value: type
        });
      }

      if (createdBy) {
        filters.push({
          name: 'created_by',
          op: 'Equal',
          value: createdBy
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(CAMPAIGNS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw new Error(error);

      return {
        campaigns: data?.List || [],
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  // Get campaign by ID
  static async getCampaignById(campaignId: number) {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(CAMPAIGNS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: 'id', op: 'Equal', value: campaignId }]

      });

      if (error) throw new Error(error);

      return data?.List?.[0] || null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  // Update campaign
  static async updateCampaign(campaignId: number, updates: Partial<Campaign>) {
    try {
      const updateData: any = {
        id: campaignId,
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.target_audience) {
        updateData.target_audience = JSON.stringify(updates.target_audience);
      }

      const { error } = await window.ezsite.apis.tableUpdate(CAMPAIGNS_TABLE_ID, updateData);
      if (error) throw new Error(error);

      return { success: true };
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  // Delete campaign
  static async deleteCampaign(campaignId: number) {
    try {
      const { error } = await window.ezsite.apis.tableDelete(CAMPAIGNS_TABLE_ID, campaignId);

      if (error) throw new Error(error);

      return { success: true };
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  // Send campaign
  static async sendCampaign(campaignId: number) {
    try {
      // Get campaign details
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign cannot be sent in its current status');
      }

      // Get target audience
      const targetAudience = JSON.parse(campaign.target_audience || '{}');
      const recipients = await this.getTargetUsers(targetAudience);

      if (recipients.length === 0) {
        throw new Error('No recipients found for this campaign');
      }

      // Update campaign status to active
      await this.updateCampaign(campaignId, { status: 'active' });

      let sentCount = 0;
      let deliveredCount = 0;

      // Send to each recipient
      for (const recipient of recipients) {
        try {
          if (campaign.type === 'email' || campaign.type === 'mixed') {
            await this.sendEmailCampaign(campaign, recipient);
            sentCount++;
            deliveredCount++;
          }

          if (campaign.type === 'whatsapp' || campaign.type === 'mixed') {
            await this.sendWhatsAppCampaign(campaign, recipient);
            sentCount++;
            deliveredCount++;
          }

          // Create in-app notification
          await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
            user_id: recipient.user_id,
            title: campaign.subject,
            message: campaign.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
            type: 'campaign',
            channel: 'in_app',
            status: 'sent',
            campaign_id: campaignId.toString(),
            created_at: new Date().toISOString(),
            sent_at: new Date().toISOString()
          });

        } catch (sendError) {
          console.error(`Error sending campaign to user ${recipient.user_id}:`, sendError);
          sentCount++;
        }
      }

      // Update campaign statistics
      await this.updateCampaign(campaignId, {
        status: 'completed',
        sent_count: sentCount,
        delivered_count: deliveredCount
      });

      return {
        success: true,
        sentCount,
        deliveredCount,
        totalRecipients: recipients.length
      };
    } catch (error) {
      console.error('Error sending campaign:', error);
      throw error;
    }
  }

  // Get target users based on audience criteria
  private static async getTargetUsers(targetAudience: any) {
    try {
      const filters: any[] = [];

      // Add filters based on targeting criteria
      if (targetAudience.authMethod) {
        filters.push({
          name: 'auth_method',
          op: 'Equal',
          value: targetAudience.authMethod
        });
      }

      if (targetAudience.emailNotifications !== undefined) {
        filters.push({
          name: 'email_notifications',
          op: 'Equal',
          value: targetAudience.emailNotifications
        });
      }

      if (targetAudience.whatsappNotifications !== undefined) {
        filters.push({
          name: 'whatsapp_notifications',
          op: 'Equal',
          value: targetAudience.whatsappNotifications
        });
      }

      if (targetAudience.marketingNotifications !== undefined) {
        filters.push({
          name: 'marketing_notifications',
          op: 'Equal',
          value: targetAudience.marketingNotifications
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(USER_PROFILES_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000,
        Filters: filters
      });

      if (error) throw new Error(error);

      return data?.List || [];
    } catch (error) {
      console.error('Error getting target users:', error);
      return [];
    }
  }

  // Send email campaign to a user
  private static async sendEmailCampaign(campaign: Campaign, recipient: any) {
    try {
      // For demo purposes, we'll send a simplified email
      // In production, you'd use the user's actual email from the User table
      const userEmail = `${recipient.user_id}@example.com`;

      await window.ezsite.apis.sendEmail({
        from: 'support@ezsite.ai',
        to: [userEmail],
        subject: campaign.subject,
        html: campaign.content
      });
    } catch (error) {
      console.error('Error sending email campaign:', error);
      throw error;
    }
  }

  // Send WhatsApp campaign to a user
  private static async sendWhatsAppCampaign(campaign: Campaign, recipient: any) {
    try {
      if (!recipient.phone_number) return;

      // Create WhatsApp message record
      await window.ezsite.apis.tableCreate(WHATSAPP_TABLE_ID, {
        phone_number: recipient.phone_number,
        message_type: 'text',
        message_content: campaign.content.replace(/<[^>]*>/g, ''), // Strip HTML
        status: 'sent',
        user_id: recipient.user_id,
        campaign_id: campaign.id.toString(),
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending WhatsApp campaign:', error);
      throw error;
    }
  }

  // Get campaign analytics
  static async getCampaignAnalytics(campaignId: number) {
    try {
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      // Calculate metrics
      const openRate = campaign.sent_count > 0 ? campaign.opened_count / campaign.sent_count * 100 : 0;
      const clickRate = campaign.sent_count > 0 ? campaign.clicked_count / campaign.sent_count * 100 : 0;
      const deliveryRate = campaign.sent_count > 0 ? campaign.delivered_count / campaign.sent_count * 100 : 0;

      return {
        campaign,
        analytics: {
          sentCount: campaign.sent_count,
          deliveredCount: campaign.delivered_count,
          openedCount: campaign.opened_count,
          clickedCount: campaign.clicked_count,
          openRate: Number(openRate.toFixed(2)),
          clickRate: Number(clickRate.toFixed(2)),
          deliveryRate: Number(deliveryRate.toFixed(2))
        }
      };
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  }

  // Pause/Resume campaign
  static async toggleCampaignStatus(campaignId: number, status: 'paused' | 'active') {
    try {
      await this.updateCampaign(campaignId, { status });
      return { success: true };
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      throw error;
    }
  }

  // Get campaign performance summary
  static async getCampaignSummary() {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(CAMPAIGNS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000
      });

      if (error) throw new Error(error);

      const campaigns = data?.List || [];

      const summary = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c: any) => c.status === 'active').length,
        completedCampaigns: campaigns.filter((c: any) => c.status === 'completed').length,
        draftCampaigns: campaigns.filter((c: any) => c.status === 'draft').length,
        totalSent: campaigns.reduce((sum: number, c: any) => sum + c.sent_count, 0),
        totalDelivered: campaigns.reduce((sum: number, c: any) => sum + c.delivered_count, 0),
        totalOpened: campaigns.reduce((sum: number, c: any) => sum + c.opened_count, 0),
        totalClicked: campaigns.reduce((sum: number, c: any) => sum + c.clicked_count, 0)
      };

      return summary;
    } catch (error) {
      console.error('Error fetching campaign summary:', error);
      throw error;
    }
  }
}
