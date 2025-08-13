import { useState, useEffect } from "react";
import { apiService, UserProfile } from "../services/api";

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await apiService.getPublicProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // For public pages, we don't show errors - just use null profile
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading };
};
