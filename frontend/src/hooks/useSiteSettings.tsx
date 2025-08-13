import { useState, useEffect } from "react";
import { apiService, type SiteSettings } from "../services/api";

interface UseSiteSettingsReturn {
  siteSettings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  seoTitle: "Henry Agyemang - Full Stack Developer",
  seoDescription:
    "Experienced full-stack developer specializing in React, Node.js, and cloud solutions.",
  githubUrl: null,
  linkedinUrl: null,
  twitterUrl: null,
  emailUrl: null,
  analyticsEnabled: true,
  contactFormEnabled: true,
};

export const useSiteSettings = (): UseSiteSettingsReturn => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await apiService.getSiteSettings();
      setSiteSettings(settings);
    } catch (err) {
      console.error("Error fetching site settings:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load site settings"
      );
      // Use default settings on error
      setSiteSettings(DEFAULT_SITE_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  return {
    siteSettings: siteSettings || DEFAULT_SITE_SETTINGS,
    loading,
    error,
    refetch: fetchSiteSettings,
  };
};

export { DEFAULT_SITE_SETTINGS };
