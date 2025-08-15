import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseEnumPipe,
  BadRequestException,
  Ip,
  Headers,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsCollectionService, VisitEventData } from './analytics-collection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

enum TimePeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_YEAR = 'this_year',
  CUSTOM = 'custom',
}

enum GroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsCollectionService: AnalyticsCollectionService,
  ) { }

  private getDateRange(period: TimePeriod, startDate?: string, endDate?: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case TimePeriod.TODAY:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        };

      case TimePeriod.YESTERDAY: {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      }

      case TimePeriod.LAST_7_DAYS:
        return {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
        };

      case TimePeriod.LAST_30_DAYS:
        return {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
        };

      case TimePeriod.LAST_90_DAYS:
        return {
          start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now,
        };

      case TimePeriod.THIS_MONTH:
        return {
          start: new Date(today.getFullYear(), today.getMonth(), 1),
          end: now,
        };

      case TimePeriod.LAST_MONTH: {
        const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return {
          start: firstOfLastMonth,
          end: new Date(firstOfThisMonth.getTime() - 1),
        };
      }

      case TimePeriod.THIS_YEAR:
        return {
          start: new Date(today.getFullYear(), 0, 1),
          end: now,
        };

      case TimePeriod.CUSTOM:
        if (!startDate || !endDate) {
          throw new BadRequestException('Start date and end date are required for custom period');
        }
        return {
          start: new Date(startDate),
          end: new Date(endDate),
        };

      default:
        return {
          start: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
          end: now,
        };
    }
  }

  // ============= DATA COLLECTION ENDPOINTS =============
  // These endpoints are for collecting visitor data (not protected by auth)

  @Post('track-visit')
  async trackVisit(
    @Body() data: { path: string; sessionId?: string; referer?: string },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const visitData: VisitEventData = {
        path: data.path,
        ipAddress,
        userAgent,
        referer: data.referer,
        sessionId: data.sessionId,
        isUnique: true, // Will be validated in trackVisit method
      };

      const result = await this.analyticsCollectionService.trackVisit(visitData);

      // Return success even if tracking was skipped (admin path or non-unique)
      return {
        success: true,
        id: result?.id || null,
        tracked: result !== null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('track-page-view')
  async trackPageView(
    @Body() data: { path: string; sessionId?: string; referer?: string; duration?: number },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const sessionData: Partial<VisitEventData> = {
        ipAddress,
        userAgent,
        referer: data.referer,
        sessionId: data.sessionId,
        duration: data.duration,
      };

      const result = await this.analyticsCollectionService.trackPageView(data.path, sessionData);

      // Return success even if tracking was skipped (admin path or non-unique)
      return {
        success: true,
        id: result?.id || null,
        tracked: result !== null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('track-interaction')
  async trackInteraction(
    @Body() data: {
      type: string;
      element?: string;
      value?: string;
      metadata?: any;
      sessionId?: string;
      path?: string;
    },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const sessionData: Partial<VisitEventData> = {
        ipAddress,
        userAgent,
        sessionId: data.sessionId,
        path: data.path,
      };

      const result = await this.analyticsCollectionService.trackInteraction(
        data.type,
        {
          element: data.element,
          value: data.value,
          metadata: data.metadata,
          path: data.path,
        },
        sessionData,
      );

      // Return success even if tracking was skipped (admin path)
      return {
        success: true,
        id: result?.id || null,
        tracked: result !== null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============= PROTECTED ANALYTICS ENDPOINTS =============

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getAnalyticsOverview(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    // Calculate previous period for growth comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(end.getTime() - periodLength);

    const [overview, previousOverview] = await Promise.all([
      this.analyticsService.getAnalyticsOverview(start, end),
      this.analyticsService.getAnalyticsOverview(previousStart, previousEnd),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      ...overview,
      growth: {
        visitors: calculateGrowth(overview.totalVisitors, previousOverview.totalVisitors),
        pageViews: calculateGrowth(overview.totalPageViews, previousOverview.totalPageViews),
        avgSessionDuration: calculateGrowth(overview.avgSessionDuration, previousOverview.avgSessionDuration),
        bounceRate: calculateGrowth(overview.bounceRate, previousOverview.bounceRate),
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        type: period,
      },
    };
  }

  @Get('traffic-growth')
  @UseGuards(JwtAuthGuard)
  async getTrafficGrowthChart(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('groupBy', new ParseEnumPipe(GroupBy))
    groupBy: GroupBy = GroupBy.DAY,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);
    return this.analyticsService.getTrafficGrowthChart(start, end, groupBy);
  }

  @Get('device-breakdown')
  @UseGuards(JwtAuthGuard)
  async getDeviceBreakdown(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);
    return this.analyticsService.getDeviceBreakdown(start, end);
  }

  @Get('browser-stats')
  @UseGuards(JwtAuthGuard)
  async getBrowserStats(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);
    return this.analyticsService.getBrowserStats(start, end);
  }

  @Get('operating-systems')
  @UseGuards(JwtAuthGuard)
  async getOperatingSystemStats(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);
    return this.analyticsService.getOperatingSystemStats(start, end);
  }

  @Get('traffic-sources')
  @UseGuards(JwtAuthGuard)
  async getTrafficSources(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);
    return this.analyticsService.getTrafficSources(start, end);
  }

  @Get('top-pages')
  @UseGuards(JwtAuthGuard)
  async getTopPages(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);
    return this.analyticsService.getTopPages(start, end, limit);
  }

  @Get('comprehensive')
  @UseGuards(JwtAuthGuard)
  async getComprehensiveAnalytics(
    @Query('period', new ParseEnumPipe(TimePeriod))
    period: TimePeriod = TimePeriod.LAST_30_DAYS,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const [
      overview,
      trafficGrowth,
      deviceBreakdown,
      browserStats,
      osStats,
      trafficSources,
      topPages,
      contactSubmissions,
      projectEngagement,
      cvDownloads,
    ] = await Promise.all([
      this.analyticsService.getAnalyticsOverview(start, end),
      this.analyticsService.getTrafficGrowthChart(start, end, GroupBy.DAY),
      this.analyticsService.getDeviceBreakdown(start, end),
      this.analyticsService.getBrowserStats(start, end),
      this.analyticsService.getOperatingSystemStats(start, end),
      this.analyticsService.getTrafficSources(start, end),
      this.analyticsService.getTopPages(start, end, 10),
      this.analyticsService.getContactFormSubmissions(start, end),
      this.analyticsService.getProjectEngagement(start, end),
      this.analyticsService.getCVDownloads(start, end),
    ]);

    return {
      overview,
      trafficGrowth,
      deviceBreakdown,
      browserStats,
      osStats,
      trafficSources,
      topPages,
      contactSubmissions,
      projectEngagement,
      cvDownloads,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        type: period,
      },
    };
  }
}
