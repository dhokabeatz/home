import { v4 as uuidv4 } from 'uuid';

// Types for analytics data
export interface AnalyticsEvent {
  path: string;
  sessionId: string;
  referer?: string;
  duration?: number;
  timestamp: Date;
}

export interface InteractionEvent {
  type: string;
  element?: string;
  value?: string;
  metadata?: any;
  sessionId: string;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: Date;
  private lastPageStartTime: Date;
  private baseUrl: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = new Date();
    this.lastPageStartTime = new Date();

    // Use the backend URL from environment or default to localhost:4000
    this.baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

    this.initializeTracking();
  }  /**
   * Get or create a unique session ID
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');

    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('analytics_session_id', sessionId);
      sessionStorage.setItem('session_start_time', new Date().toISOString());
    }

    return sessionId;
  }

  /**
   * Initialize tracking for page views and user interactions
   */
  private initializeTracking() {
    // Track initial page view
    this.trackPageView();

    // Track page visibility changes (for session duration)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackPageDuration();
      } else {
        this.lastPageStartTime = new Date();
      }
    });

    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      this.trackPageDuration();
    });

    // Track navigation (for SPAs)
    this.trackNavigationChanges();
  }

  /**
   * Track page views
   */
  async trackPageView(path?: string) {
    const currentPath = path || window.location.pathname;

    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/track-page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: currentPath,
          sessionId: this.sessionId,
          referer: document.referrer || undefined,
        }),
      });

      if (!response.ok) {
        console.warn('Analytics: Failed to track page view');
      }
    } catch (error) {
      console.warn('Analytics: Error tracking page view:', error);
    }

    // Update last page start time
    this.lastPageStartTime = new Date();
  }

  /**
   * Track page duration when user leaves or switches tabs
   */
  private async trackPageDuration() {
    const duration = Date.now() - this.lastPageStartTime.getTime();

    if (duration < 1000) return; // Ignore very short durations

    try {
      await fetch(`${this.baseUrl}/api/analytics/track-page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: window.location.pathname,
          sessionId: this.sessionId,
          duration: Math.round(duration / 1000), // Duration in seconds
        }),
      });
    } catch (error) {
      console.warn('Analytics: Error tracking page duration:', error);
    }
  }

  /**
   * Track user interactions (clicks, form submissions, etc.)
   */
  async trackInteraction(type: string, element?: string, value?: string, metadata?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/track-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          element,
          value,
          metadata,
          sessionId: this.sessionId,
          path: window.location.pathname,
        }),
      });

      if (!response.ok) {
        console.warn('Analytics: Failed to track interaction');
      }
    } catch (error) {
      console.warn('Analytics: Error tracking interaction:', error);
    }
  }

  /**
   * Track navigation changes in Single Page Applications
   */
  private trackNavigationChanges() {
    let currentPath = window.location.pathname;

    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);

      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        analytics.trackPageView();
      }
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);

      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        analytics.trackPageView();
      }
    };

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    });
  }

  /**
   * Track form submissions
   */
  async trackFormSubmission(formName: string, formData?: any) {
    return this.trackInteraction('form_submission', formName, undefined, formData);
  }

  /**
   * Track button clicks
   */
  async trackButtonClick(buttonName: string, metadata?: any) {
    return this.trackInteraction('button_click', buttonName, undefined, metadata);
  }

  /**
   * Track file downloads
   */
  async trackDownload(fileName: string, fileType?: string) {
    return this.trackInteraction('download', fileName, fileType);
  }

  /**
   * Track external link clicks
   */
  async trackExternalLink(url: string) {
    return this.trackInteraction('external_link', url);
  }

  /**
   * Track custom events
   */
  async trackCustomEvent(eventName: string, eventData?: any) {
    return this.trackInteraction('custom_event', eventName, undefined, eventData);
  }
}

// Create a singleton instance
export const analytics = new AnalyticsService();

// Export utility functions for easy use
export const trackPageView = (path?: string) => analytics.trackPageView(path);
export const trackInteraction = (type: string, element?: string, value?: string, metadata?: any) =>
  analytics.trackInteraction(type, element, value, metadata);
export const trackFormSubmission = (formName: string, formData?: any) =>
  analytics.trackFormSubmission(formName, formData);
export const trackButtonClick = (buttonName: string, metadata?: any) =>
  analytics.trackButtonClick(buttonName, metadata);
export const trackDownload = (fileName: string, fileType?: string) =>
  analytics.trackDownload(fileName, fileType);
export const trackExternalLink = (url: string) =>
  analytics.trackExternalLink(url);
export const trackCustomEvent = (eventName: string, eventData?: any) =>
  analytics.trackCustomEvent(eventName, eventData);

export default analytics;
