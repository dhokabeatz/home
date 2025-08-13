import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Mail,
  Download,
  MousePointer,
  Calendar,
  RefreshCw,
  Monitor,
  BarChart3,
} from "lucide-react";
import {
  apiService,
  TimePeriod,
  ComprehensiveAnalytics,
} from "../../services/api";
import { useRealTimeAnalytics } from "../../hooks/useRealTimeAnalytics";
import AnalyticsCard from "../../components/analytics/AnalyticsCard";
import ChartContainer from "../../components/analytics/ChartContainer";
import toast from "react-hot-toast";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const timePeriodOptions: { value: TimePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_90_days", label: "Last 90 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] =
    useState<TimePeriod>("last_30_days");
  const [refreshing, setRefreshing] = useState(false);

  // Real-time analytics hook
  const {
    analyticsData: realTimeData,
    recentActivity,
    liveVisitors,
    isConnected,
    error: wsError,
    requestUpdate,
    clearActivity,
  } = useRealTimeAnalytics();

  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      // Use comprehensive analytics endpoint to get real backend data
      const data = await apiService.getComprehensiveAnalytics(selectedPeriod);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update analytics when real-time data is available
  useEffect(() => {
    if (realTimeData) {
      // Map realTimeData to ComprehensiveAnalytics shape
      setAnalytics((prev) => ({
        ...prev,
        ...realTimeData,
        browserStats: realTimeData.browserStats
          ? realTimeData.browserStats.map((b: any) => ({
              browser: b.browser,
              _count: { id: b.count ?? (b._count?.id ?? 0) },
            }))
          : prev?.browserStats ?? [],
        trafficSources: realTimeData.trafficSources
          ? realTimeData.trafficSources.map((source: any) => ({
              source: source.source,
              visitors: source.visitors,
              percentage: source.percentage ?? 0,
            }))
          : prev?.trafficSources ?? [],
        topPages: realTimeData.topPages
          ? realTimeData.topPages.map((page: any) => ({
              path: page.page || page.path || '',
              pageViews: page.views || page.pageViews || 0,
              avgTimeOnPage: page.avgTimeOnPage || 0,
              bounceRate: page.bounceRate || 0,
            }))
          : prev?.topPages ?? [],
      }) as ComprehensiveAnalytics);
      setLoading(false);
    }
  }, [realTimeData]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  // Show WebSocket connection errors
  useEffect(() => {
    if (wsError) {
      toast.error(wsError);
    }
  }, [wsError]);

  const handleRefresh = () => {
    // Try real-time update first, fallback to API
    if (isConnected) {
      requestUpdate();
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1000);
    } else {
      fetchAnalytics(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const deviceData = (analytics.deviceBreakdown || []).map((device) => ({
    name: device.deviceType,
    value: device.visitors,
    percentage: device.percentage,
  }));

  const trafficSourceData = (analytics.trafficSources || []).map((source) => ({
    name: source.source,
    value: source.visitors,
    percentage: source.percentage,
  }));

  const browserData = (analytics.browserStats || [])
    .filter((b) => b.browser)
    .slice(0, 5)
    .map((browser) => ({
      name: browser.browser,
      visitors: browser._count.id,
    }));

  const osData = (analytics.osStats || [])
    .filter((os) => os.browser)
    .slice(0, 5)
    .map((os) => ({
      name: os.browser,
      visitors: os._count.id,
    }));

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Analytics Dashboard
              </h1>
              {/* Real-time status indicator */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 mt-1">
              <p className="text-sm sm:text-base text-gray-600">
                Comprehensive insights into your portfolio performance
              </p>
              {/* Live visitor count */}
              {liveVisitors > 0 && (
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <Users className="h-4 w-4" />
                  <span>{liveVisitors} online now</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="time-period-select"
                className="flex items-center text-gray-500"
              >
                <Calendar className="h-4 w-4 flex-shrink-0" />
              </label>
              <select
                id="time-period-select"
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(e.target.value as TimePeriod)
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0 flex-1 sm:w-auto"
                aria-label="Select time period for analytics"
              >
                {timePeriodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Key Metrics - Improved responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <AnalyticsCard
            title="Total Visitors"
            value={analytics.overview?.totalVisitors || 0}
            change={analytics.overview?.visitorGrowth || 0}
            icon={Users}
            color="bg-blue-600"
            description="Unique visitors to your portfolio"
          />
          <AnalyticsCard
            title="Page Views"
            value={analytics.overview?.totalPageViews || 0}
            icon={Eye}
            color="bg-green-600"
            description="Total pages viewed by visitors"
          />
          <AnalyticsCard
            title="Avg. Session Duration"
            value={Math.round(analytics.overview?.avgSessionDuration || 0)}
            icon={Clock}
            color="bg-purple-600"
            suffix="s"
            description="Average time spent on site"
          />
          <AnalyticsCard
            title="Bounce Rate"
            value={(analytics.overview?.bounceRate || 0).toFixed(1)}
            icon={TrendingDown}
            color="bg-orange-600"
            suffix="%"
            description="Visitors who left after one page"
          />
        </div>

        {/* Traffic Growth Chart - Full width with fixed height */}
        <ChartContainer
          title="Traffic Growth"
          description="Daily visitors and page views over time"
        >
          {(analytics.trafficGrowth || []).length > 0 ? (
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trafficGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <div className="text-center px-4">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  No traffic data available
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Traffic trends will appear once visitors access your site
                </p>
              </div>
            </div>
          )}
        </ChartContainer>

        {/* Real-time Activity Feed */}
        {recentActivity.length > 0 && (
          <ChartContainer
            title="Live Activity"
            description="Real-time visitor activity on your portfolio"
          >
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivity
                .slice(-10)
                .reverse()
                .map((activity, index) => {
                  let bgColor = "";
                  if (activity.type === "visit") {
                    bgColor = "bg-blue-500";
                  } else if (activity.type === "download") {
                    bgColor = "bg-green-500";
                  } else if (activity.type === "page_view") {
                    bgColor = "bg-purple-500";
                  } else {
                    bgColor = "bg-orange-500";
                  }
                  return (
                    <div
                      key={`${activity.timestamp}-${index}`}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${bgColor}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.type === "visit" && "New visitor"}
                          {activity.type === "page_view" && "Page viewed"}
                          {activity.type === "download" && "CV Downloaded"}
                          {activity.type === "interaction" && activity.action}
                          {activity.page && ` on ${activity.page}`}
                        </p>
                        {activity.location && (
                          <p className="text-xs text-gray-500">
                            from {activity.location}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              {recentActivity.length > 10 && (
                <button
                  onClick={clearActivity}
                  className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Clear Activity (showing last 10 of {recentActivity.length})
                </button>
              )}
            </div>
          </ChartContainer>
        )}

        {/* Device & Traffic Charts - Better responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Device Breakdown */}
          <ChartContainer
            title="Device Types"
            description="Breakdown of visitors by device type"
          >
            {deviceData.length > 0 ? (
              <>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percentage }) =>
                          `${name} ${percentage.toFixed(1)}%`
                        }
                      >
                        {deviceData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name}-${entry.value}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
                  {deviceData.map((device, index) => (
                    <div key={device.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm text-gray-600 truncate">
                        {device.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 sm:h-64 flex items-center justify-center">
                <div className="text-center px-4">
                  <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No device data available
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Data will appear once visitors access your site
                  </p>
                </div>
              </div>
            )}
          </ChartContainer>

          {/* Traffic Sources */}
          <ChartContainer
            title="Traffic Sources"
            description="Where your visitors are coming from"
          >
            {trafficSourceData.length > 0 ? (
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficSourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 sm:h-64 flex items-center justify-center">
                <div className="text-center px-4">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No traffic source data available
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Source data will appear once visitors access your site
                  </p>
                </div>
              </div>
            )}
          </ChartContainer>
        </div>

        {/* Browser & OS Stats - Improved responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Browser Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top Browsers
            </h3>
            {browserData.length > 0 ? (
              <div className="space-y-4">
                {browserData.map((browser, index) => (
                  <div
                    key={browser.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="font-medium truncate">
                        {browser.name}
                      </span>
                    </div>
                    <span className="text-gray-600 ml-2 flex-shrink-0">
                      {browser.visitors.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">
                    No browser data available
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Data will appear once visitors access your site
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Operating Systems */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Operating Systems
            </h3>
            {osData.length > 0 ? (
              <div className="space-y-4">
                {osData.map((os, index) => (
                  <div
                    key={os.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="font-medium truncate">{os.name}</span>
                    </div>
                    <span className="text-gray-600 ml-2 flex-shrink-0">
                      {os.visitors.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">No OS data available</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Data will appear once visitors access your site
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Pages - Improved table layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Pages
          </h3>
          {(analytics.topPages || []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">
                      Page
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">
                      Views
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm hidden sm:table-cell">
                      Avg. Time
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm hidden lg:table-cell">
                      Bounce Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.topPages || []).map((page, index) => (
                    <tr
                      key={`${page.path}-${index}-${page.pageViews}`}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-2 sm:px-4 max-w-0">
                        <span
                          className="font-medium text-sm truncate block"
                          title={page.path}
                        >
                          {page.path}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-sm">
                        {page.pageViews.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-sm hidden sm:table-cell">
                        {Math.round(page.avgTimeOnPage)}s
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-sm hidden lg:table-cell">
                        {page.bounceRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-sm">No page data available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Data will appear once visitors access your site
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Engagement Metrics - Better responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <AnalyticsCard
            title="Contact Form Submissions"
            value={analytics.contactSubmissions || 0}
            icon={Mail}
            color="bg-blue-600"
            description="Messages received from visitors"
          />

          <AnalyticsCard
            title="CV Downloads"
            value={analytics.cvDownloads || 0}
            icon={Download}
            color="bg-green-600"
            description="Resume/CV file downloads"
          />

          <AnalyticsCard
            title="Project Clicks"
            value={(analytics.projectEngagement || []).reduce(
              (sum, p) => sum + (p._count?.id || 0),
              0
            )}
            icon={MousePointer}
            color="bg-purple-600"
            description="Total project interactions"
          />
        </div>

        {/* Project Engagement - Improved responsive table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Project Engagement
          </h3>
          {(analytics.projectEngagement || []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">
                      Project
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">
                      Views
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm hidden sm:table-cell">
                      Avg. Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.projectEngagement || []).map((project, index) => (
                    <tr
                      key={`${project.path}-${index}-${project._count.id}`}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-2 sm:px-4 max-w-0">
                        <span
                          className="font-medium text-sm truncate block"
                          title={project.path}
                        >
                          {project.path}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-sm">
                        {project._count.id.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-sm hidden sm:table-cell">
                        {project._avg.duration
                          ? Math.round(project._avg.duration)
                          : 0}
                        s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  No project engagement data available
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Data will appear once visitors interact with your projects
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
