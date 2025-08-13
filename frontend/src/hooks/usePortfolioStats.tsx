import { useState, useEffect } from "react";
import { apiService, PortfolioStats } from "../services/api";

export const usePortfolioStats = () => {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await apiService.getPortfolioStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch portfolio stats:", error);
        // Fallback to default stats if API fails
        setStats({
          projectsCompleted: 23,
          yearsExperience: 3,
          clientSatisfaction: 100,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
