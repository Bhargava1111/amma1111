// Extensions to CampaignService for real-time functionality
import { EmailService } from './EmailService';
import { WhatsAppService } from './WhatsAppService';

const CAMPAIGNS_TABLE_ID = '10413';
const NOTIFICATIONS_TABLE_ID = '10412';
const WHATSAPP_TABLE_ID = '10414';
const USER_PROFILES_TABLE_ID = '10411';
const CAMPAIGN_ANALYTICS_TABLE_ID = '10417';
const CAMPAIGN_RECIPIENTS_TABLE_ID = '10418';

export class CampaignServiceExtensions {
  // Real-time campaign sending with progress tracking
  static async sendCampaignRealTime(campaignId: string, progressCallback?: (progress: any) => void) {
    try {
      console.log('Starting real-time campaign send for:', campaignId);
      
      // Get campaign details
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      if (!['draft', 'scheduled', 'paused'].includes(campaign.status)) {
        throw new Error('Campaign cannot be sent in its current status');
      }

      // Update campaign status to active
      await this.updateCampaignWithRealTime(campaignId, { 
        status: 'active',
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      });

      // Get target audience
      const targetAudience = JSON.parse(campaign.target_audience || '{}');
      const recipients = await this.getTargetUsersEnhanced(targetAudience);

      if (recipients.length === 0) {
        throw new Error('No recipients found for this campaign');
      }

      console.log(`Found ${recipients.length} recipients for campaign ${campaignId}`);

      // Create recipient records for tracking
      await this.createCampaignRecipients(campaignId, recipients);

      let sentCount = 0;
      let deliveredCount = 0;
      let failedCount = 0;
      const startTime = Date.now();

      // Send in batches for better performance
      const batchSize = 50;
      const totalBatches = Math.ceil(recipients.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batch = recipients.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
        
        console.log(`Processing batch ${batchIndex + 1}/${totalBatches} with ${batch.length} recipients`);

        // Process batch concurrently but with rate limiting
        const batchResults = await Promise.allSettled(
          batch.map(recipient => this.sendToRecipient(campaign, recipient))
        );

        // Update counts and progress
        batchResults.forEach((result, index) => {
          const recipient = batch[index];
          if (result.status === 'fulfilled' && result.value.success) {
            sentCount++;
            deliveredCount++;
            this.updateRecipientStatus(campaignId, recipient.user_id, 'delivered');
          } else {
            sentCount++;
            failedCount++;
            this.updateRecipientStatus(campaignId, recipient.user_id, 'failed', 
              result.status === 'rejected' ? result.reason?.toString() : 'Unknown error');
          }
        });

        // Calculate progress
        const progress = {
          campaignId,
          totalRecipients: recipients.length,
          sentCount,
          deliveredCount,
          failedCount,
          completedBatches: batchIndex + 1,
          totalBatches,
          progressPercentage: Math.round(((batchIndex + 1) / totalBatches) * 100),
          currentSendRate: sentCount / ((Date.now() - startTime) / 1000 / 60), // per minute
          estimatedCompletion: this.calculateEstimatedCompletion(
            startTime, 
            sentCount, 
            recipients.length
          )
        };

        // Notify progress callback
        if (progressCallback) {
          progressCallback(progress);
        }

        // Update campaign statistics in real-time
        await this.updateCampaignStats(campaignId, {
          sent_count: sentCount,
          delivered_count: deliveredCount,
          failed_count: failedCount,
          last_activity_at: new Date().toISOString()
        });

        // Log analytics for this batch
        await this.logCampaignAnalytics(campaignId, {
          action_type: 'sent',
          channel: campaign.type,
          batch_number: batchIndex + 1,
          batch_size: batch.length,
          timestamp: new Date().toISOString()
        });

        // Rate limiting - wait between batches
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }

      // Mark campaign as completed
      await this.updateCampaignWithRealTime(campaignId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        delivered_count: deliveredCount,
        failed_count: failedCount,
        last_activity_at: new Date().toISOString()
      });

      // Send completion notifications
      await this.sendCampaignCompletionNotifications(campaignId, {
        sentCount,
        deliveredCount,
        failedCount,
        totalRecipients: recipients.length
      });

      console.log(`Campaign ${campaignId} completed. Sent: ${sentCount}, Delivered: ${deliveredCount}, Failed: ${failedCount}`);

      return {
        success: true,
        sentCount,
        deliveredCount,
        failedCount,
        totalRecipients: recipients.length,
        duration: Date.now() - startTime
      };
    } catch (error) {
      console.error('Error sending campaign:', error);
      
      // Update campaign status to failed
      await this.updateCampaignWithRealTime(campaignId, {
        status: 'failed',
        last_activity_at: new Date().toISOString()
      });
      
      throw error;
    }
  }

  // Get real-time campaign statistics
  static async getRealTimeStats(campaignId: string): Promise<any> {
    try {
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      // Get recipient statistics
      const recipientStats = await this.getRecipientStats(campaignId);
      
      // Get analytics data
      const analytics = await this.getCampaignAnalyticsData(campaignId);

      // Calculate rates and metrics
      const totalRecipients = campaign.audience_count || 0;
      const sentCount = campaign.sent_count || 0;
      const deliveredCount = campaign.delivered_count || 0;
      const openedCount = campaign.opened_count || 0;
      const clickedCount = campaign.clicked_count || 0;
      const failedCount = campaign.failed_count || 0;

      const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
      const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
      const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
      const failureRate = sentCount > 0 ? (failedCount / sentCount) * 100 : 0;

      // Calculate send rate
      const startTime = campaign.started_at ? new Date(campaign.started_at).getTime() : Date.now();
      const currentTime = Date.now();
      const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
      const currentSendRate = elapsedMinutes > 0 ? sentCount / elapsedMinutes : 0;

      // Estimate completion time
      const remainingRecipients = totalRecipients - sentCount;
      const estimatedCompletion = currentSendRate > 0 
        ? new Date(currentTime + (remainingRecipients / currentSendRate) * 60 * 1000).toISOString()
        : '';

      return {
        campaign_id: campaignId,
        total_recipients: totalRecipients,
        sent_count: sentCount,
        delivered_count: deliveredCount,
        opened_count: openedCount,
        clicked_count: clickedCount,
        failed_count: failedCount,
        conversion_count: campaign.conversion_count || 0,
        delivery_rate: Number(deliveryRate.toFixed(2)),
        open_rate: Number(openRate.toFixed(2)),
        click_rate: Number(clickRate.toFixed(2)),
        failure_rate: Number(failureRate.toFixed(2)),
        current_send_rate: Number(currentSendRate.toFixed(2)),
        estimated_completion: estimatedCompletion,
        last_updated: new Date().toISOString(),
        status: campaign.status,
        revenue_generated: campaign.revenue_generated || 0,
        roi_percentage: campaign.roi_percentage || 0,
        recipient_breakdown: recipientStats,
        recent_activity: analytics.slice(0, 10) // Latest 10 activities
      };
    } catch (error) {
      console.error('Error getting real-time stats:', error);
      return {
        campaign_id: campaignId,
        total_recipients: 0,
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        failed_count: 0,
        conversion_count: 0,
        current_send_rate: 0,
        estimated_completion: '',
        last_updated: new Date().toISOString()
      };
    }
  }

  // Enhanced target audience calculation
  static async calculateAudienceSize(targetAudience: any): Promise<number> {
    try {
      const recipients = await this.getTargetUsersEnhanced(targetAudience);
      return recipients.length;
    } catch (error) {
      console.error('Error calculating audience size:', error);
      return 0;
    }
  }

  // Get enhanced target users with additional filtering
  private static async getTargetUsersEnhanced(targetAudience: any) {
    try {
      const filters: any[] = [];

      // Basic filters
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

      // Advanced filters
      if (targetAudience.location) {
        // Add location-based filtering if available
      }

      if (targetAudience.ageRange) {
        // Add age range filtering if available
      }

      if (targetAudience.lastActiveDate) {
        filters.push({
          name: 'updated_at',
          op: 'GreaterThanOrEqual',
          value: targetAudience.lastActiveDate
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(USER_PROFILES_TABLE_ID, {
        PageNo: 1,
        PageSize: 10000, // Large number to get all matching users
        Filters: filters
      });

      if (error) throw new Error(error);

      return data?.List || [];
    } catch (error) {
      console.error('Error getting enhanced target users:', error);
      return [];
    }
  }

  // Send to individual recipient with personalization
  private static async sendToRecipient(campaign: any, recipient: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Personalize content if enabled
      let personalizedContent = campaign.content;
      let personalizedSubject = campaign.subject;

      if (campaign.personalization_enabled) {
        personalizedContent = this.personalizeContent(campaign.content, recipient);
        personalizedSubject = this.personalizeContent(campaign.subject, recipient);
      }

      // Send based on campaign type
      if (campaign.type === 'email' || campaign.type === 'mixed') {
        const emailResult = await this.sendEmailCampaignEnhanced(
          campaign, 
          recipient, 
          personalizedSubject, 
          personalizedContent
        );
        if (!emailResult.success) {
          return emailResult;
        }
      }

      if (campaign.type === 'whatsapp' || campaign.type === 'mixed') {
        const whatsappResult = await this.sendWhatsAppCampaignEnhanced(
          campaign, 
          recipient, 
          personalizedContent
        );
        if (!whatsappResult.success) {
          return whatsappResult;
        }
      }

      // Create in-app notification
      await window.ezsite.apis.tableCreate(NOTIFICATIONS_TABLE_ID, {
        user_id: recipient.user_id,
        title: personalizedSubject,
        message: personalizedContent.replace(/<[^>]*>/g, ''), // Strip HTML tags
        type: 'campaign',
        channel: 'in_app',
        status: 'sent',
        campaign_id: campaign.id.toString(),
        created_at: new Date().toISOString(),
        sent_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error(`Error sending to recipient ${recipient.user_id}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Enhanced email campaign sending
  private static async sendEmailCampaignEnhanced(
    campaign: any, 
    recipient: any, 
    subject: string, 
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userEmail = recipient.email || `${recipient.user_id}@example.com`;
      
      const emailResult = await EmailService.sendEmail({
        to: userEmail,
        subject: subject,
        html: content,
        headers: {
          'X-Campaign-ID': campaign.id.toString(),
          'X-Recipient-ID': recipient.user_id,
          'X-MANAfoods-Campaign': 'true'
        }
      });

      return emailResult;
    } catch (error) {
      console.error('Error sending enhanced email campaign:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email send failed' 
      };
    }
  }

  // Enhanced WhatsApp campaign sending
  private static async sendWhatsAppCampaignEnhanced(
    campaign: any, 
    recipient: any, 
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!recipient.phone_number) {
        return { success: false, error: 'No phone number available' };
      }

      const whatsappResult = await WhatsAppService.sendTextMessage(
        recipient.phone_number,
        content.replace(/<[^>]*>/g, ''), // Strip HTML for WhatsApp
        {
          campaign_id: campaign.id.toString(),
          user_id: recipient.user_id
        }
      );

      return whatsappResult;
    } catch (error) {
      console.error('Error sending enhanced WhatsApp campaign:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'WhatsApp send failed' 
      };
    }
  }

  // Personalize content with recipient data
  private static personalizeContent(template: string, recipient: any): string {
    let personalized = template;
    
    // Replace common placeholders
    personalized = personalized.replace(/\{\{name\}\}/g, recipient.full_name || 'Valued Customer');
    personalized = personalized.replace(/\{\{first_name\}\}/g, 
      recipient.full_name ? recipient.full_name.split(' ')[0] : 'Friend');
    personalized = personalized.replace(/\{\{email\}\}/g, recipient.email || '');
    personalized = personalized.replace(/\{\{phone\}\}/g, recipient.phone_number || '');
    
    // Add timestamp
    personalized = personalized.replace(/\{\{current_date\}\}/g, 
      new Date().toLocaleDateString());
    personalized = personalized.replace(/\{\{current_time\}\}/g, 
      new Date().toLocaleTimeString());
    
    return personalized;
  }

  // Campaign completion notifications
  private static async sendCampaignCompletionNotifications(
    campaignId: string, 
    stats: any
  ): Promise<void> {
    try {
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) return;

      // Send WhatsApp notification to admin
      const adminMessage = `
🎯 *Campaign Completed - MANAfoods*

Campaign: ${campaign.name}
Status: ✅ COMPLETED

📊 *Results:*
• Total Recipients: ${stats.totalRecipients}
• Successfully Sent: ${stats.sentCount}
• Delivered: ${stats.deliveredCount}
• Failed: ${stats.failedCount}
• Success Rate: ${((stats.deliveredCount / stats.sentCount) * 100).toFixed(1)}%

📅 Completed: ${new Date().toLocaleString()}

#MANAfoods #CampaignComplete
`;

      await WhatsAppService.sendTextMessage('+919390872628', adminMessage, {
        campaign_id: campaignId,
        notification_type: 'campaign_completion'
      });

      // Send email notification
      await EmailService.sendEmail({
        to: ['admin@manaeats.com', 'marketing@manaeats.com'],
        subject: `Campaign Completed: ${campaign.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Campaign Completion Report</h2>
            <p><strong>Campaign:</strong> ${campaign.name}</p>
            <p><strong>Type:</strong> ${campaign.type}</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Results Summary</h3>
              <ul>
                <li>Total Recipients: ${stats.totalRecipients}</li>
                <li>Successfully Sent: ${stats.sentCount}</li>
                <li>Delivered: ${stats.deliveredCount}</li>
                <li>Failed: ${stats.failedCount}</li>
                <li>Success Rate: ${((stats.deliveredCount / stats.sentCount) * 100).toFixed(1)}%</li>
              </ul>
            </div>
            
            <p>Campaign completed at: ${new Date().toLocaleString()}</p>
          </div>
        `
      });

    } catch (error) {
      console.error('Error sending completion notifications:', error);
    }
  }

  // Utility methods
  private static calculateEstimatedCompletion(startTime: number, completed: number, total: number): string {
    if (completed === 0) return '';
    
    const elapsed = Date.now() - startTime;
    const rate = completed / elapsed; // items per millisecond
    const remaining = total - completed;
    const estimatedTime = remaining / rate;
    
    return new Date(Date.now() + estimatedTime).toISOString();
  }

  // Additional helper methods would go here...
  static async getCampaignById(campaignId: string): Promise<any> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(CAMPAIGNS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: campaignId }]
      });

      if (error) throw new Error(error);
      return data?.List?.[0] || null;
    } catch (error) {
      console.error('Error fetching campaign by ID:', error);
      return null;
    }
  }

  static async updateCampaignWithRealTime(campaignId: string, updates: any): Promise<void> {
    try {
      const updateData = {
        id: campaignId,
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableUpdate(CAMPAIGNS_TABLE_ID, updateData);
      if (error) throw new Error(error);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  private static async createCampaignRecipients(campaignId: string, recipients: any[]): Promise<void> {
    // Implementation for creating recipient tracking records
  }

  private static async updateRecipientStatus(
    campaignId: string, 
    userId: string, 
    status: string, 
    reason?: string
  ): Promise<void> {
    // Implementation for updating recipient status
  }

  private static async updateCampaignStats(campaignId: string, stats: any): Promise<void> {
    await this.updateCampaignWithRealTime(campaignId, stats);
  }

  private static async logCampaignAnalytics(campaignId: string, analytics: any): Promise<void> {
    // Implementation for logging detailed analytics
  }

  private static async getRecipientStats(campaignId: string): Promise<any> {
    // Implementation for getting recipient statistics
    return {};
  }

  private static async getCampaignAnalyticsData(campaignId: string): Promise<any[]> {
    // Implementation for getting analytics data
    return [];
  }

  private static async sendCampaignCreationNotifications(campaignData: any): Promise<void> {
    try {
      // Send WhatsApp notification
      const message = `
🎯 *New Campaign Created - MANAfoods*

Campaign: ${campaignData.name}
Type: ${campaignData.type.toUpperCase()}
Priority: ${campaignData.priority.toUpperCase()}
Status: ${campaignData.status.toUpperCase()}

📊 Target Audience: ${campaignData.audience_count || 0} users
📅 Created: ${new Date().toLocaleString()}
👤 By: ${campaignData.created_by}

#MANAfoods #NewCampaign
`;

      await WhatsAppService.sendTextMessage('+919390872628', message, {
        campaign_id: campaignData.id,
        notification_type: 'campaign_created'
      });

      // Send email notification
      await EmailService.sendEmail({
        to: ['admin@manaeats.com', 'marketing@manaeats.com'],
        subject: `New Campaign Created: ${campaignData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Campaign Created</h2>
            <p><strong>Name:</strong> ${campaignData.name}</p>
            <p><strong>Type:</strong> ${campaignData.type}</p>
            <p><strong>Priority:</strong> ${campaignData.priority}</p>
            <p><strong>Status:</strong> ${campaignData.status}</p>
            <p><strong>Target Audience:</strong> ${campaignData.audience_count || 0} users</p>
            <p><strong>Created by:</strong> ${campaignData.created_by}</p>
            <p><strong>Created at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Error sending creation notifications:', error);
    }
  }
}
