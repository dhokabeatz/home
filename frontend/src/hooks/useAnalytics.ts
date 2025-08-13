import { useEffect } from 'react';
import { analytics } from '../services/analytics';

/**
 * Hook to automatically track page views
 */
export const useAnalytics = (pageName?: string) => {
  useEffect(() => {
    // Track page view when component mounts
    const path = pageName || window.location.pathname;
    analytics.trackPageView(path);
  }, [pageName]);

  return {
    // Expose analytics methods for manual tracking
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackDownload: analytics.trackDownload.bind(analytics),
    trackExternalLink: analytics.trackExternalLink.bind(analytics),
    trackCustomEvent: analytics.trackCustomEvent.bind(analytics),
  };
};

/**
 * Hook specifically for tracking button clicks
 */
export const useTrackClick = () => {
  const trackClick = (buttonName: string, metadata?: any) => {
    analytics.trackButtonClick(buttonName, metadata);
  };

  return trackClick;
};

/**
 * Hook for tracking form submissions
 */
export const useTrackForm = () => {
  const trackSubmission = (formName: string, formData?: any) => {
    analytics.trackFormSubmission(formName, formData);
  };

  return trackSubmission;
};

/**
 * Hook for tracking downloads
 */
export const useTrackDownload = () => {
  const trackDownload = (fileName: string, fileType?: string) => {
    analytics.trackDownload(fileName, fileType);
  };

  return trackDownload;
};
