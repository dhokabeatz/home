import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AnalyticsOverview {
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  visitorGrowth: number;
}

export interface TrafficGrowthData {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface DeviceBreakdown {
  deviceType: string;
  visitors: number;
  percentage: number;
}

export interface PagePerformanceData {
  path: string;
  pageViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalyticsOverview(
    startDate: Date,
    endDate: Date,
    previousPeriodStart?: Date,
    previousPeriodEnd?: Date,
  ): Promise<AnalyticsOverview> {
    // Get current period data from existing VisitAggregate model
    const currentPeriodData = await this.prisma.visitAggregate.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        visitors: true,
        pageViews: true,
      },
      _avg: {
        avgDuration: true,
        bounceRate: true,
      },
    });

    let visitorGrowth = 0;
    if (previousPeriodStart && previousPeriodEnd) {
      const previousPeriodData = await this.prisma.visitAggregate.aggregate({
        where: {
          date: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
        _sum: {
          visitors: true,
        },
      });

      const currentVisitors = currentPeriodData._sum.visitors || 0;
      const previousVisitors = previousPeriodData._sum.visitors || 0;

      if (previousVisitors > 0) {
        visitorGrowth =
          ((currentVisitors - previousVisitors) / previousVisitors) * 100;
      }
    }

    const totalVisitors = currentPeriodData._sum.visitors || 0;
    const totalPageViews = currentPeriodData._sum.pageViews || 0;

    return {
      totalVisitors,
      totalPageViews,
      avgSessionDuration: currentPeriodData._avg.avgDuration || 0,
      bounceRate: currentPeriodData._avg.bounceRate || 0,
      visitorGrowth,
    };
  }

  async getTrafficGrowthChart(
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day",
  ): Promise<TrafficGrowthData[]> {
    const data = await this.prisma.visitAggregate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group data based on the specified period
    const groupedData = new Map<
      string,
      {
        visitors: number;
        pageViews: number;
      }
    >();

    data.forEach((item) => {
      let key: string;
      const date = new Date(item.date);

      switch (groupBy) {
        case "week": {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        }
        case "month": {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        }
        default: {
          key = item.date.toISOString().split("T")[0];
        }
      }

      const existing = groupedData.get(key) || { visitors: 0, pageViews: 0 };
      groupedData.set(key, {
        visitors: existing.visitors + item.visitors,
        pageViews: existing.pageViews + item.pageViews,
      });
    });

    return Array.from(groupedData.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getDeviceBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<DeviceBreakdown[]> {
    // Get device data from VisitEvent model
    const data = await this.prisma.visitEvent.groupBy({
      by: ["device"],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        device: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalVisitors = data.reduce((sum, item) => sum + item._count.id, 0);

    return data.map((item) => ({
      deviceType: item.device || "Unknown",
      visitors: item._count.id,
      percentage:
        totalVisitors > 0 ? (item._count.id / totalVisitors) * 100 : 0,
    }));
  }

  async getBrowserStats(startDate: Date, endDate: Date) {
    const data = await this.prisma.visitEvent.groupBy({
      by: ["browser"],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        browser: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    return data;
  }

  async getOperatingSystemStats(startDate: Date, endDate: Date) {
    return await this.prisma.visitEvent.groupBy({
      by: ["device"], // Using device as OS for now
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        device: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });
  }

  async getTrafficSources(startDate: Date, endDate: Date) {
    // Get traffic sources from referer data
    const data = await this.prisma.visitEvent.groupBy({
      by: ["referer"],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalVisitors = data.reduce((sum, item) => sum + item._count.id, 0);

    return data.map((item) => {
      let source = "Direct";
      const referer = item.referer;

      if (referer) {
        if (referer.includes("google")) source = "Google";
        else if (referer.includes("facebook")) source = "Facebook";
        else if (referer.includes("linkedin")) source = "LinkedIn";
        else if (referer.includes("twitter")) source = "Twitter";
        else source = "Referral";
      }

      return {
        source,
        visitors: item._count.id,
        percentage:
          totalVisitors > 0 ? (item._count.id / totalVisitors) * 100 : 0,
      };
    });
  }

  async getTopPages(
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<PagePerformanceData[]> {
    const data = await this.prisma.visitAggregate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        pageViews: "desc",
      },
      take: limit,
    });

    return data.map((item) => ({
      path: item.path || "/",
      pageViews: item.pageViews,
      avgTimeOnPage: item.avgDuration || 0,
      bounceRate: item.bounceRate || 0,
    }));
  }

  async getContactFormSubmissions(startDate: Date, endDate: Date) {
    const count = await this.prisma.contact.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return count;
  }

  async getProjectEngagement(startDate: Date, endDate: Date) {
    const data = await this.prisma.visitEvent.groupBy({
      by: ["path"],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        path: {
          startsWith: "/projects/",
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        duration: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    return data;
  }

  // Mock data methods for demonstration
  async getMockAnalyticsData() {
    return {
      overview: {
        totalVisitors: 12450,
        totalPageViews: 23840,
        avgSessionDuration: 145.7,
        bounceRate: 42.3,
        visitorGrowth: 12.5,
      },
      trafficGrowth: [
        { date: "2024-08-05", visitors: 1200, pageViews: 2100 },
        { date: "2024-08-06", visitors: 1350, pageViews: 2400 },
        { date: "2024-08-07", visitors: 1100, pageViews: 1950 },
        { date: "2024-08-08", visitors: 1450, pageViews: 2600 },
        { date: "2024-08-09", visitors: 1320, pageViews: 2300 },
        { date: "2024-08-10", visitors: 1580, pageViews: 2850 },
        { date: "2024-08-11", visitors: 1650, pageViews: 2950 },
      ],
      deviceBreakdown: [
        { deviceType: "Desktop", visitors: 7500, percentage: 60.2 },
        { deviceType: "Mobile", visitors: 4200, percentage: 33.7 },
        { deviceType: "Tablet", visitors: 750, percentage: 6.1 },
      ],
      trafficSources: [
        { source: "Direct", visitors: 5200, percentage: 41.8 },
        { source: "Google", visitors: 4100, percentage: 32.9 },
        { source: "LinkedIn", visitors: 1800, percentage: 14.5 },
        { source: "GitHub", visitors: 900, percentage: 7.2 },
        { source: "Twitter", visitors: 450, percentage: 3.6 },
      ],
      browsers: [
        { browser: "Chrome", visitors: 8900, percentage: 71.5 },
        { browser: "Safari", visitors: 2100, percentage: 16.9 },
        { browser: "Firefox", visitors: 950, percentage: 7.6 },
        { browser: "Edge", visitors: 500, percentage: 4.0 },
      ],
      operatingSystems: [
        { os: "Windows", visitors: 6200, percentage: 49.8 },
        { os: "macOS", visitors: 3400, percentage: 27.3 },
        { os: "iOS", visitors: 1800, percentage: 14.5 },
        { os: "Android", visitors: 850, percentage: 6.8 },
        { os: "Linux", visitors: 200, percentage: 1.6 },
      ],
      topPages: [
        { path: "/", pageViews: 8500, avgTimeOnPage: 125, bounceRate: 35.2 },
        {
          path: "/projects",
          pageViews: 4200,
          avgTimeOnPage: 180,
          bounceRate: 28.5,
        },
        {
          path: "/about",
          pageViews: 3100,
          avgTimeOnPage: 95,
          bounceRate: 45.1,
        },
        {
          path: "/contact",
          pageViews: 2800,
          avgTimeOnPage: 65,
          bounceRate: 52.3,
        },
        {
          path: "/services",
          pageViews: 2400,
          avgTimeOnPage: 110,
          bounceRate: 38.7,
        },
      ],
      conversions: {
        contactFormSubmissions: 45,
        cvDownloads: 128,
        projectClicks: 340,
        socialClicks: 85,
      },
      projectEngagement: [
        { path: "/projects/ecommerce-app", views: 850, avgTime: 240 },
        { path: "/projects/portfolio-site", views: 720, avgTime: 190 },
        { path: "/projects/task-manager", views: 680, avgTime: 165 },
        { path: "/projects/weather-app", views: 450, avgTime: 140 },
      ],
    };
  }

  /**
   * Get CV/Resume download statistics
   */
  async getCVDownloads(startDate: Date, endDate: Date): Promise<number> {
    try {
      const cvDownloads = await this.prisma.userInteraction.count({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          action: "download",
          OR: [
            { element: { contains: "cv" } },
            { element: { contains: "resume" } },
            { value: { contains: ".pdf" } },
            { value: { contains: "cv" } },
            { value: { contains: "resume" } },
          ],
        },
      });

      return cvDownloads;
    } catch (error) {
      console.error("Error fetching CV downloads:", error);
      return 0; // Return 0 if there's an error
    }
  }

  /**
   * Get comprehensive analytics data (similar to controller method)
   */
  async getComprehensiveAnalytics(period: string = "last_30_days") {
    // Calculate date range based on period
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now);
        break;
      case "yesterday":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
          23,
          59,
          59,
        );
        break;
      case "last_7_days":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = new Date(now);
        break;
      case "last_30_days":
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = new Date(now);
        break;
    }

    const [
      overview,
      trafficGrowth,
      deviceBreakdown,
      browserStats,
      osStats,
      trafficSources,
      topPages,
      contactSubmissions,
      cvDownloads,
    ] = await Promise.all([
      this.getAnalyticsOverview(start, end),
      this.getTrafficGrowthChart(start, end, "day"),
      this.getDeviceBreakdown(start, end),
      this.getBrowserStats(start, end),
      this.getOperatingSystemStats(start, end),
      this.getTrafficSources(start, end),
      this.getTopPages(start, end, 10),
      this.getContactFormSubmissions(start, end),
      this.getCVDownloads(start, end),
    ]);

    return {
      overview,
      trafficGrowth,
      deviceBreakdown,
      browserStats,
      operatingSystemStats: osStats,
      trafficSources,
      topPages,
      contactFormSubmissions: contactSubmissions,
      cvDownloads,
      period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };
  }
}
