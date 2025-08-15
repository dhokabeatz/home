import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface VisitEventData {
  path: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  device?: string;
  browser?: string;
  os?: string;
  sessionId?: string;
  duration?: number;
  isUnique?: boolean;
  isBounce?: boolean;
}

@Injectable()
export class AnalyticsCollectionService {
  private analyticsGateway: any; // Will be injected later to avoid circular dependency

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Set analytics gateway for real-time updates
   */
  setAnalyticsGateway(gateway: any) {
    this.analyticsGateway = gateway;
  }

  /**
   * Track a visitor event (page view, interaction, etc.)
   */
  async trackVisit(data: VisitEventData) {
    try {
      // Filter out admin routes - don't track visits to admin pages
      if (this.isAdminPath(data.path)) {
        return null; // Don't track admin visits
      }

      // Check if this is a unique visitor based on IP and time window
      const isUniqueVisitor = await this.checkUniqueVisitor(data.ipAddress, data.path);

      // If not unique (same IP visited same path within last hour), skip tracking
      if (!isUniqueVisitor) {
        return null; // Don't count refreshes/repeated visits from same IP
      }

      // Create visit event
      const visitEvent = await this.prisma.visitEvent.create({
        data: {
          path: data.path,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          referer: data.referer,
          country: data.country,
          device: data.device,
          browser: data.browser,
          os: data.os,
          sessionId: data.sessionId,
          duration: data.duration,
          isUnique: true, // Only unique visitors reach this point
          isBounce: data.isBounce || false,
          timestamp: new Date(),
        },
      });

      // Update daily aggregates only for non-admin visits
      await this.updateDailyAggregates(data);

      // Broadcast real-time visitor activity if gateway is available
      if (this.analyticsGateway) {
        this.analyticsGateway.broadcastVisitorActivity({
          type: 'visit',
          page: data.path,
          timestamp: new Date(),
          userAgent: data.userAgent,
          location: data.country,
        });

        // Broadcast updated analytics data
        this.analyticsGateway.broadcastAnalyticsUpdate();
      }

      return visitEvent;
    } catch (error) {
      console.error('Error tracking visit:', error);
      throw error;
    }
  }

  /**
   * Check if path is an admin route that should be excluded from analytics
   */
  private isAdminPath(path: string): boolean {
    const adminPaths = [
      '/admin',
      '/admin/',
      '/admin/dashboard',
      '/admin/analytics',
      '/admin/projects',
      '/admin/settings',
      '/admin/media',
      '/admin/contacts',
      '/admin/services',
      '/admin/team',
      '/admin/skills',
      '/admin/technologies',
      '/admin/login'
    ];

    // Check if path starts with any admin path
    return adminPaths.some(adminPath =>
      path === adminPath || path.startsWith(adminPath + '/')
    );
  }

  /**
   * Check if visitor is unique based on IP address and time window
   * Only count as new visit if same IP hasn't visited same path in last hour
   */
  private async checkUniqueVisitor(ipAddress: string, path: string): Promise<boolean> {
    if (!ipAddress) return true; // If no IP, allow the visit

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentVisit = await this.prisma.visitEvent.findFirst({
      where: {
        ipAddress: ipAddress,
        path: path,
        timestamp: {
          gte: oneHourAgo
        }
      }
    });

    return !recentVisit; // Return true if no recent visit found
  }

  /**
   * Track a page view event
   */
  async trackPageView(path: string, sessionData: Partial<VisitEventData>) {
    // Don't track admin page views
    if (this.isAdminPath(path)) {
      return null;
    }

    const deviceInfo = this.parseUserAgent(sessionData.userAgent);

    return this.trackVisit({
      ...sessionData,
      path,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });
  }

  /**
   * Track user interaction (button click, form submission, etc.)
   */
  async trackInteraction(type: string, data: any, sessionData: Partial<VisitEventData>) {
    // Don't track interactions on admin pages
    const path = sessionData.path || data.path || '/';
    if (this.isAdminPath(path)) {
      return null;
    }

    // Store in user_interactions table
    return this.prisma.userInteraction.create({
      data: {
        sessionId: sessionData.sessionId || 'anonymous',
        path: path,
        action: type,
        element: data.element,
        value: data.value,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Update daily aggregated analytics data
   */
  private async updateDailyAggregates(data: VisitEventData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Update or create visit aggregate for today
      await this.prisma.visitAggregate.upsert({
        where: {
          date_path: {
            date: today,
            path: data.path,
          },
        },
        create: {
          date: today,
          path: data.path,
          visitors: 1,
          pageViews: 1,
          uniqueVisitors: data.isUnique ? 1 : 0,
          avgDuration: data.duration || 0,
          bounceRate: data.isBounce ? 100 : 0,
        },
        update: {
          visitors: { increment: 1 },
          pageViews: { increment: 1 },
          uniqueVisitors: data.isUnique ? { increment: 1 } : undefined,
          // Update averages (simplified - in production you'd want running averages)
          avgDuration: data.duration || undefined,
        },
      });

      // Update device analytics
      if (data.device) {
        await this.updateDeviceAnalytics(data, today);
      }

      // Update traffic source analytics
      if (data.referer) {
        await this.updateTrafficSourceAnalytics(data, today);
      }

    } catch (error) {
      console.error('Error updating daily aggregates:', error);
    }
  }

  /**
   * Update device analytics aggregates
   */
  private async updateDeviceAnalytics(data: VisitEventData, date: Date) {
    await this.prisma.deviceAnalytics.upsert({
      where: {
        date_deviceType_browser_os: {
          date,
          deviceType: data.device || 'Unknown',
          browser: data.browser || 'Unknown',
          os: data.os || 'Unknown',
        },
      },
      create: {
        date,
        deviceType: data.device || 'Unknown',
        browser: data.browser,
        os: data.os,
        visitors: 1,
        sessions: 1,
        bounceRate: data.isBounce ? 100 : 0,
        avgDuration: data.duration || 0,
      },
      update: {
        visitors: { increment: 1 },
        sessions: { increment: 1 },
      },
    });
  }

  /**
   * Update traffic source analytics
   */
  private async updateTrafficSourceAnalytics(data: VisitEventData, date: Date) {
    const source = this.getTrafficSource(data.referer);

    try {
      await this.prisma.trafficSource.upsert({
        where: {
          date_source_medium_campaign: {
            date,
            source: source.source,
            medium: source.medium || 'unknown',
            campaign: source.campaign || 'unknown',
          },
        },
        create: {
          date,
          source: source.source,
          medium: source.medium || 'unknown',
          campaign: source.campaign || 'unknown',
          visitors: 1,
          sessions: 1,
        },
        update: {
          visitors: { increment: 1 },
          sessions: { increment: 1 },
        },
      });
    } catch (error) {
      console.error('Error updating traffic source analytics:', error);
    }
  }

  /**
   * Parse user agent to extract device info
   */
  private parseUserAgent(userAgent?: string) {
    if (!userAgent) {
      return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    }

    let device = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect device
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device = /iPad/.test(userAgent) ? 'Tablet' : 'Mobile';
    }

    // Detect browser
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';
    else if (/Opera/.test(userAgent)) browser = 'Opera';

    // Detect OS
    if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Mac OS X/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad/.test(userAgent)) os = 'iOS';

    return { device, browser, os };
  }

  /**
   * Determine traffic source from referer
   */
  private getTrafficSource(referer?: string) {
    if (!referer) {
      return { source: 'Direct', medium: 'none', campaign: 'direct' };
    }

    let source = 'Referral';
    let medium = 'referral';
    let campaign = 'referral';

    if (referer.includes('google.com')) {
      source = 'Google';
      medium = 'organic';
      campaign = 'google-search';
    } else if (referer.includes('facebook.com')) {
      source = 'Facebook';
      medium = 'social';
      campaign = 'facebook';
    } else if (referer.includes('linkedin.com')) {
      source = 'LinkedIn';
      medium = 'social';
      campaign = 'linkedin';
    } else if (referer.includes('twitter.com')) {
      source = 'Twitter';
      medium = 'social';
      campaign = 'twitter';
    } else if (referer.includes('instagram.com')) {
      source = 'Instagram';
      medium = 'social';
      campaign = 'instagram';
    }

    return { source, medium, campaign };
  }
}
