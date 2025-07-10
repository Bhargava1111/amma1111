const CAMPAIGNS_TABLE_ID = '10413';
const NOTIFICATIONS_TABLE_ID = '10412';
const WHATSAPP_TABLE_ID = '10414';
const USER_PROFILES_TABLE_ID = '10411';
const CAMPAIGN_ANALYTICS_TABLE_ID = '10417';
const CAMPAIGN_RECIPIENTS_TABLE_ID = '10418';

export interface Campaign {
  id: number;
  name: string;
  description: string;
  type: 'email' | 'whatsapp' | 'mixed' | 'push' | 'sms';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject: string;
  content: string;
  template_id?: string;
  template_variables?: any;
  target_audience: string;
  audience_count?: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  failed_count: number;
  unsubscribed_count: number;
  bounce_count: number;
  spam_count: number;
  conversion_count: number;
  revenue_generated: number;
  budget_allocated: number;
  cost_per_click: number;
  roi_percentage: number;
  ab_test_enabled: boolean;
  ab_test_variant?: 'A' | 'B';
  geographical_targeting?: string;
  device_targeting?: string;
  time_zone_targeting?: string;
  frequency_cap?: number;
  auto_resend_enabled: boolean;
  resend_delay_hours?: number;
  personalization_enabled: boolean;
  dynamic_content?: any;
  tags: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  user_id?: string;
  action_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted' | 'unsubscribed' | 'bounced' | 'spam';
  channel: 'email' | 'whatsapp' | 'push' | 'sms';
  timestamp: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  location?: string;
  referrer?: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  user_id: string;
  email?: string;
  phone_number?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  failed_reason?: string;
  personalized_content?: any;
  tracking_id?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  type: Campaign['type'];
  subject_template: string;
  content_template: string;
  variables: string[];
  category: string;
  preview_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RealTimeCampaignStats {
  campaign_id: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  failed_count: number;
  conversion_count: number;
  current_send_rate: number;
  estimated_completion: string;
  last_updated: string;
}

export class CampaignService {
  // Real-time listeners
  private static listeners: Set<(campaigns: Campaign[]) => void> = new Set();
  private static statsListeners: Map<string, Set<(stats: RealTimeCampaignStats) => void>> = new Map();
  private static pollingInterval: NodeJS.Timeout | null = null;
  private static statsPollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  // WebSocket simulation for real-time updates
  private static wsConnection: WebSocket | null = null;
  
  // Real-time subscription management
  static subscribeToCampaigns(callback: (campaigns: Campaign[]) => void) {
    this.listeners.add(callback);
    
    if (!this.pollingInterval) {
      this.startPolling();
    }
    
    // Immediately fetch current campaigns
    this.fetchAndNotifyListeners();
    
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  static subscribeToCampaignStats(campaignId: string, callback: (stats: RealTimeCampaignStats) => void) {
    if (!this.statsListeners.has(campaignId)) {
      this.statsListeners.set(campaignId, new Set());
    }
    
    this.statsListeners.get(campaignId)!.add(callback);
    
    // Start polling for this campaign stats
    if (!this.statsPollingIntervals.has(campaignId)) {
      this.startStatsPolling(campaignId);
    }
    
    return () => {
      const listeners = this.statsListeners.get(campaignId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.stopStatsPolling(campaignId);
        }
      }
    };
  }

  private static startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(() => {
      this.fetchAndNotifyListeners();
    }, 5000); // Poll every 5 seconds
  }

  private static stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private static startStatsPolling(campaignId: string) {
    const interval = setInterval(async () => {
      try {
        const stats = await this.getRealTimeStats(campaignId);
        const listeners = this.statsListeners.get(campaignId);
        if (listeners) {
          listeners.forEach(callback => callback(stats));
        }
      } catch (error) {
        console.error('Error polling campaign stats:', error);
      }
    }, 3000); // Poll every 3 seconds for stats
    
    this.statsPollingIntervals.set(campaignId, interval);
  }

  private static stopStatsPolling(campaignId: string) {
    const interval = this.statsPollingIntervals.get(campaignId);
    if (interval) {
      clearInterval(interval);
      this.statsPollingIntervals.delete(campaignId);
    }
  }

  private static async fetchAndNotifyListeners() {
    if (this.listeners.size === 0) return;
    
    try {
      const result = await this.getCampaigns({ pageNo: 1, pageSize: 100 });
      this.listeners.forEach(callback => callback(result.campaigns));
    } catch (error) {
      console.error('Error in campaign polling:', error);
    }
  }

  // Enhanced campaign creation with real-time features
  static async createCampaign(params: {
    name: string;
    description: string;
    type: Campaign['type'];
    priority?: Campaign['priority'];
    subject: string;
    content: string;
    templateId?: string;
    templateVariables?: any;
    targetAudience: any;
    scheduledAt?: string;
    abTestEnabled?: boolean;
    personalizationEnabled?: boolean;
    geographicalTargeting?: string;
    deviceTargeting?: string;
    budgetAllocated?: number;
    tags?: string[];
    notes?: string;
    createdBy: string;
  }) {
    try {
      const {
        name,
        description,
        type,
        priority = 'normal',
        subject,
        content,
        templateId,
        templateVariables,
        targetAudience,
        scheduledAt,
        abTestEnabled = false,
        personalizationEnabled = false,
        geographicalTargeting,
        deviceTargeting,
        budgetAllocated = 0,
        tags = [],
        notes,
        createdBy
      } = params;

      // Calculate audience count
      const audienceCount = await this.calculateAudienceSize(targetAudience);

      const campaignData = {
        name,
        description,
        type,
        priority,
        status: scheduledAt ? 'scheduled' : 'draft',
        subject,
        content,
        template_id: templateId || '',
        template_variables: templateVariables ? JSON.stringify(templateVariables) : '',
        target_audience: JSON.stringify(targetAudience),
        audience_count: audienceCount,
        scheduled_at: scheduledAt || '',
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        failed_count: 0,
        unsubscribed_count: 0,
        bounce_count: 0,
        spam_count: 0,
        conversion_count: 0,
        revenue_generated: 0,
        budget_allocated: budgetAllocated,
        cost_per_click: 0,
        roi_percentage: 0,
        ab_test_enabled: abTestEnabled,
        geographical_targeting: geographicalTargeting || '',
        device_targeting: deviceTargeting || '',
        frequency_cap: 1,
        auto_resend_enabled: false,
        personalization_enabled: personalizationEnabled,
        tags: JSON.stringify(tags),
        notes: notes || '',
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      };

      console.log('Creating campaign with data:', campaignData);
      const { error } = await window.ezsite.apis.tableCreate(CAMPAIGNS_TABLE_ID, campaignData);
      if (error) throw new Error(error);

      // Real-time notification to all listeners
      this.fetchAndNotifyListeners();

      // Enhanced admin notification with WhatsApp integration
      try {
        await this.sendCampaignCreationNotifications(campaignData);
      } catch (notifError) {
        console.error('Error sending campaign creation notifications:', notifError);
      }

      return { success: true, audienceCount };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Get all campaigns with real-time data
  static async getCampaigns(params: {
    pageNo?: number;
    pageSize?: number;
    status?: string;
    type?: string;
    priority?: string;
    createdBy?: string;
    tags?: string[];
    searchTerm?: string;
    dateRange?: { start: string; end: string };
  } = {}) {
    try {
      const { 
        pageNo = 1, 
        pageSize = 20, 
        status, 
        type, 
        priority,
        createdBy, 
        tags,
        searchTerm,
        dateRange
      } = params;

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

      if (priority && priority !== 'all') {
        filters.push({
          name: 'priority',
          op: 'Equal',
          value: priority
        });
      }

      if (createdBy) {
        filters.push({
          name: 'created_by',
          op: 'Equal',
          value: createdBy
        });
      }

      if (searchTerm) {
        filters.push({
          name: 'name',
          op: 'StringContains',
          value: searchTerm
        });
      }

      if (dateRange) {
        filters.push(
          { name: 'created_at', op: 'GreaterThanOrEqual', value: dateRange.start },
          { name: 'created_at', op: 'LessThanOrEqual', value: dateRange.end }
        );
      }

      const { data, error } = await window.ezsite.apis.tablePage(CAMPAIGNS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'last_activity_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw new Error(error);

      // Enhance campaigns with real-time data
      const enhancedCampaigns = await Promise.all(
        (data?.List || []).map(async (campaign: any) => {
          try {
            const stats = await this.getRealTimeStats(campaign.id);
            return {
              ...campaign,
              tags: campaign.tags ? JSON.parse(campaign.tags) : [],
              target_audience: campaign.target_audience ? JSON.parse(campaign.target_audience) : {},
              template_variables: campaign.template_variables ? JSON.parse(campaign.template_variables) : {},
              real_time_stats: stats
            };
          } catch (e) {
            return {
              ...campaign,
              tags: campaign.tags ? JSON.parse(campaign.tags) : [],
              target_audience: campaign.target_audience ? JSON.parse(campaign.target_audience) : {},
              template_variables: campaign.template_variables ? JSON.parse(campaign.template_variables) : {}
            };
          }
        })
      );

      return {
        campaigns: enhancedCampaigns,
        totalCount: data?.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data?.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  // Get campaign by ID with real-time data
  static async getCampaignById(campaignId: number) {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(CAMPAIGNS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'id', op: 'Equal', value: campaignId }]
      });

      if (error) throw new Error(error);

      const campaign = data?.List?.[0];
      if (!campaign) return null;

      // Enhance with real-time stats
      try {
        const stats = await this.getRealTimeStats(campaignId.toString());
        return {
          ...campaign,
          tags: campaign.tags ? JSON.parse(campaign.tags) : [],
          target_audience: campaign.target_audience ? JSON.parse(campaign.target_audience) : {},
          template_variables: campaign.template_variables ? JSON.parse(campaign.template_variables) : {},
          real_time_stats: stats
        };
      } catch (e) {
        return {
          ...campaign,
          tags: campaign.tags ? JSON.parse(campaign.tags) : [],
          target_audience: campaign.target_audience ? JSON.parse(campaign.target_audience) : {},
          template_variables: campaign.template_variables ? JSON.parse(campaign.template_variables) : {}
        };
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  // Update campaign with real-time notifications
  static async updateCampaign(campaignId: number, updates: Partial<Campaign>) {
    try {
      const updateData: any = {
        id: campaignId,
        ...updates,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      };

      if (updates.target_audience) {
        updateData.target_audience = JSON.stringify(updates.target_audience);
      }

      if (updates.template_variables) {
        updateData.template_variables = JSON.stringify(updates.template_variables);
      }

      if (updates.tags) {
        updateData.tags = JSON.stringify(updates.tags);
      }

      const { error } = await window.ezsite.apis.tableUpdate(CAMPAIGNS_TABLE_ID, updateData);
      if (error) throw new Error(error);

      // Real-time notification to all listeners
      this.fetchAndNotifyListeners();

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

      // Real-time notification to all listeners
      this.fetchAndNotifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  // Send campaign with real-time progress tracking
  static async sendCampaign(campaignId: number, progressCallback?: (progress: any) => void) {
    try {
      // Import the extensions dynamically to avoid circular imports
      const { CampaignServiceExtensions } = await import('./CampaignServiceExtensions');
      return await CampaignServiceExtensions.sendCampaignRealTime(campaignId.toString(), progressCallback);
    } catch (error) {
      console.error('Error sending campaign:', error);
      throw error;
    }
  }

  // Get real-time statistics
  static async getRealTimeStats(campaignId: string): Promise<RealTimeCampaignStats> {
    try {
      const { CampaignServiceExtensions } = await import('./CampaignServiceExtensions');
      return await CampaignServiceExtensions.getRealTimeStats(campaignId);
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

  // Enhanced campaign analytics
  static async getCampaignAnalytics(campaignId: number) {
    try {
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const realTimeStats = await this.getRealTimeStats(campaignId.toString());

      // Calculate comprehensive metrics
      const openRate = campaign.sent_count > 0 ? (campaign.opened_count / campaign.sent_count) * 100 : 0;
      const clickRate = campaign.opened_count > 0 ? (campaign.clicked_count / campaign.opened_count) * 100 : 0;
      const deliveryRate = campaign.sent_count > 0 ? (campaign.delivered_count / campaign.sent_count) * 100 : 0;
      const conversionRate = campaign.clicked_count > 0 ? (campaign.conversion_count / campaign.clicked_count) * 100 : 0;
      const unsubscribeRate = campaign.sent_count > 0 ? (campaign.unsubscribed_count / campaign.sent_count) * 100 : 0;
      const bounceRate = campaign.sent_count > 0 ? (campaign.bounce_count / campaign.sent_count) * 100 : 0;
      const spamRate = campaign.sent_count > 0 ? (campaign.spam_count / campaign.sent_count) * 100 : 0;

      // Calculate ROI
      const totalCost = campaign.budget_allocated || 0;
      const revenue = campaign.revenue_generated || 0;
      const roi = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;

      return {
        campaign,
        realTimeStats,
        analytics: {
          sentCount: campaign.sent_count,
          deliveredCount: campaign.delivered_count,
          openedCount: campaign.opened_count,
          clickedCount: campaign.clicked_count,
          conversionCount: campaign.conversion_count,
          unsubscribedCount: campaign.unsubscribed_count,
          bounceCount: campaign.bounce_count,
          spamCount: campaign.spam_count,
          failedCount: campaign.failed_count,
          openRate: Number(openRate.toFixed(2)),
          clickRate: Number(clickRate.toFixed(2)),
          deliveryRate: Number(deliveryRate.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(2)),
          unsubscribeRate: Number(unsubscribeRate.toFixed(2)),
          bounceRate: Number(bounceRate.toFixed(2)),
          spamRate: Number(spamRate.toFixed(2)),
          roiPercentage: Number(roi.toFixed(2)),
          revenueGenerated: revenue,
          totalCost: totalCost,
          profitLoss: revenue - totalCost
        },
        performance: {
          engagementScore: this.calculateEngagementScore(campaign),
          deliverabilityScore: this.calculateDeliverabilityScore(campaign),
          effectivenessScore: this.calculateEffectivenessScore(campaign)
        }
      };
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  }

  // Calculate engagement score
  private static calculateEngagementScore(campaign: any): number {
    if (campaign.sent_count === 0) return 0;
    
    const openWeight = 0.3;
    const clickWeight = 0.4;
    const conversionWeight = 0.3;
    
    const openScore = (campaign.opened_count / campaign.sent_count) * 100;
    const clickScore = campaign.opened_count > 0 ? (campaign.clicked_count / campaign.opened_count) * 100 : 0;
    const conversionScore = campaign.clicked_count > 0 ? (campaign.conversion_count / campaign.clicked_count) * 100 : 0;
    
    return Number(((openScore * openWeight) + (clickScore * clickWeight) + (conversionScore * conversionWeight)).toFixed(1));
  }

  // Calculate deliverability score
  private static calculateDeliverabilityScore(campaign: any): number {
    if (campaign.sent_count === 0) return 0;
    
    const deliveryRate = (campaign.delivered_count / campaign.sent_count) * 100;
    const bounceRate = (campaign.bounce_count / campaign.sent_count) * 100;
    const spamRate = (campaign.spam_count / campaign.sent_count) * 100;
    
    const score = deliveryRate - (bounceRate * 2) - (spamRate * 3);
    return Number(Math.max(0, Math.min(100, score)).toFixed(1));
  }

  // Calculate effectiveness score
  private static calculateEffectivenessScore(campaign: any): number {
    const engagementScore = this.calculateEngagementScore(campaign);
    const deliverabilityScore = this.calculateDeliverabilityScore(campaign);
    const roiScore = Math.min(100, Math.max(0, campaign.roi_percentage || 0));
    
    return Number(((engagementScore * 0.4) + (deliverabilityScore * 0.3) + (roiScore * 0.3)).toFixed(1));
  }

  // Pause/Resume campaign with real-time updates
  static async toggleCampaignStatus(campaignId: number, status: 'paused' | 'active') {
    try {
      await this.updateCampaign(campaignId, { 
        status,
        last_activity_at: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      throw error;
    }
  }

  // Get comprehensive campaign performance summary
  static async getCampaignSummary() {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(CAMPAIGNS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1000
      });

      if (error) throw new Error(error);

      const campaigns = data?.List || [];

      // Calculate comprehensive summary
      const summary = {
        totalCampaigns: campaigns.length,
        campaignsByStatus: {
          draft: campaigns.filter((c: any) => c.status === 'draft').length,
          scheduled: campaigns.filter((c: any) => c.status === 'scheduled').length,
          active: campaigns.filter((c: any) => c.status === 'active').length,
          completed: campaigns.filter((c: any) => c.status === 'completed').length,
          paused: campaigns.filter((c: any) => c.status === 'paused').length,
          failed: campaigns.filter((c: any) => c.status === 'failed').length
        },
        campaignsByType: {
          email: campaigns.filter((c: any) => c.type === 'email').length,
          whatsapp: campaigns.filter((c: any) => c.type === 'whatsapp').length,
          mixed: campaigns.filter((c: any) => c.type === 'mixed').length,
          push: campaigns.filter((c: any) => c.type === 'push').length,
          sms: campaigns.filter((c: any) => c.type === 'sms').length
        },
        campaignsByPriority: {
          low: campaigns.filter((c: any) => c.priority === 'low').length,
          normal: campaigns.filter((c: any) => c.priority === 'normal').length,
          high: campaigns.filter((c: any) => c.priority === 'high').length,
          urgent: campaigns.filter((c: any) => c.priority === 'urgent').length
        },
        totalMetrics: {
          totalSent: campaigns.reduce((sum: number, c: any) => sum + (c.sent_count || 0), 0),
          totalDelivered: campaigns.reduce((sum: number, c: any) => sum + (c.delivered_count || 0), 0),
          totalOpened: campaigns.reduce((sum: number, c: any) => sum + (c.opened_count || 0), 0),
          totalClicked: campaigns.reduce((sum: number, c: any) => sum + (c.clicked_count || 0), 0),
          totalConversions: campaigns.reduce((sum: number, c: any) => sum + (c.conversion_count || 0), 0),
          totalFailed: campaigns.reduce((sum: number, c: any) => sum + (c.failed_count || 0), 0),
          totalRevenue: campaigns.reduce((sum: number, c: any) => sum + (c.revenue_generated || 0), 0),
          totalBudget: campaigns.reduce((sum: number, c: any) => sum + (c.budget_allocated || 0), 0)
        },
        averageMetrics: {
          averageOpenRate: this.calculateAverageRate(campaigns, 'opened_count', 'sent_count'),
          averageClickRate: this.calculateAverageRate(campaigns, 'clicked_count', 'opened_count'),
          averageConversionRate: this.calculateAverageRate(campaigns, 'conversion_count', 'clicked_count'),
          averageDeliveryRate: this.calculateAverageRate(campaigns, 'delivered_count', 'sent_count'),
          averageROI: this.calculateAverageROI(campaigns)
        },
        topPerformers: this.getTopPerformingCampaigns(campaigns),
        recentActivity: campaigns.filter((c: any) => {
          const lastActivity = new Date(c.last_activity_at || c.updated_at);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastActivity > dayAgo;
        }).length
      };

      return summary;
    } catch (error) {
      console.error('Error fetching campaign summary:', error);
      throw error;
    }
  }

  // Helper methods for summary calculations
  private static calculateAverageRate(campaigns: any[], numeratorField: string, denominatorField: string): number {
    const validCampaigns = campaigns.filter(c => c[denominatorField] > 0);
    if (validCampaigns.length === 0) return 0;
    
    const totalRate = validCampaigns.reduce((sum, c) => {
      return sum + (c[numeratorField] / c[denominatorField]) * 100;
    }, 0);
    
    return Number((totalRate / validCampaigns.length).toFixed(2));
  }

  private static calculateAverageROI(campaigns: any[]): number {
    const validCampaigns = campaigns.filter(c => c.budget_allocated > 0);
    if (validCampaigns.length === 0) return 0;
    
    const totalROI = validCampaigns.reduce((sum, c) => {
      const roi = ((c.revenue_generated - c.budget_allocated) / c.budget_allocated) * 100;
      return sum + roi;
    }, 0);
    
    return Number((totalROI / validCampaigns.length).toFixed(2));
  }

  private static getTopPerformingCampaigns(campaigns: any[]) {
    return campaigns
      .filter(c => c.sent_count > 0)
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        engagementScore: this.calculateEngagementScore(c),
        deliverabilityScore: this.calculateDeliverabilityScore(c),
        effectivenessScore: this.calculateEffectivenessScore(c),
        roi: c.budget_allocated > 0 ? ((c.revenue_generated - c.budget_allocated) / c.budget_allocated) * 100 : 0
      }))
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, 5);
  }

  // Advanced audience calculation with real-time data
  static async calculateAudienceSize(targetAudience: any): Promise<number> {
    try {
      const { CampaignServiceExtensions } = await import('./CampaignServiceExtensions');
      return await CampaignServiceExtensions.calculateAudienceSize(targetAudience);
    } catch (error) {
      console.error('Error calculating audience size:', error);
      return 0;
    }
  }

  // Send creation notifications
  private static async sendCampaignCreationNotifications(campaignData: any): Promise<void> {
    try {
      const { CampaignServiceExtensions } = await import('./CampaignServiceExtensions');
      return await (CampaignServiceExtensions as any).sendCampaignCreationNotifications(campaignData);
    } catch (error) {
      console.error('Error sending creation notifications:', error);
    }
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
