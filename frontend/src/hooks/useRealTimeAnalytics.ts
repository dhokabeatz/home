import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiService } from '../services/api';

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; visitors: number }>;
  deviceStats: Array<{ device: string; count: number }>;
  browserStats: Array<{ browser: string; count: number }>;
  cvDownloads: number;
  contactFormSubmissions: number;
  // Add all other properties from your comprehensive analytics
  [key: string]: any;
}

interface VisitorActivity {
  type: 'visit' | 'page_view' | 'interaction' | 'download';
  page?: string;
  action?: string;
  timestamp: Date;
  userAgent?: string;
  location?: string;
}

interface LiveVisitorCount {
  count: number;
}

export const useRealTimeAnalytics = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<VisitorActivity[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const backendUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

    const socketInstance = io(`${backendUrl}/analytics`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to analytics WebSocket');
      setIsConnected(true);
      setError(null);

      // Subscribe to analytics updates
      socketInstance.emit('subscribeToAnalytics');

      // Request initial analytics data
      socketInstance.emit('requestAnalyticsUpdate');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from analytics WebSocket');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError('Failed to connect to real-time analytics');
      setIsConnected(false);
    });

    // Analytics data updates
    socketInstance.on('analyticsUpdate', (data: AnalyticsData) => {
      console.log('Received analytics update:', data);
      setAnalyticsData(data);
    });

    // Real-time visitor activity
    socketInstance.on('visitorActivity', (activity: VisitorActivity) => {
      console.log('New visitor activity:', activity);

      setRecentActivity(prev => {
        const newActivity = [...prev, activity];
        // Keep only last 50 activities
        return newActivity.slice(-50);
      });
    });

    // Live visitor count updates
    socketInstance.on('liveVisitorCount', (data: LiveVisitorCount) => {
      setLiveVisitors(data.count);
    });

    // Error handling
    socketInstance.on('analyticsError', (error: { message: string }) => {
      console.error('Analytics error:', error);
      setError(error.message);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.emit('unsubscribeFromAnalytics');
      socketInstance.disconnect();
    };
  }, []);

  // Fetch initial analytics data as fallback
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!analyticsData) {
          const data = await apiService.getComprehensiveAnalytics();
          setAnalyticsData(data as unknown as AnalyticsData);
        }
      } catch (error) {
        console.error('Failed to fetch initial analytics:', error);
      }
    };

    fetchInitialData();
  }, [analyticsData]);

  // Request analytics update manually
  const requestUpdate = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('requestAnalyticsUpdate');
    }
  }, [socket, isConnected]);

  // Clear recent activity
  const clearActivity = useCallback(() => {
    setRecentActivity([]);
  }, []);

  return {
    analyticsData,
    recentActivity,
    liveVisitors,
    isConnected,
    error,
    requestUpdate,
    clearActivity,
  };
};
