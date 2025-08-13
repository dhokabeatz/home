import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
}

export const Skeleton = ({
  className = "",
  height = "h-4",
  width = "w-full",
}: SkeletonProps) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${height} ${width} ${className}`}
  />
);

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div
        className="bg-white rounded-xl p-6 shadow-sm"
        style={{ minHeight: "140px" }}
      >
        <Skeleton className="mb-4" height="h-8" width="w-64" />
        <Skeleton height="h-4" width="w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {["stat-1", "stat-2", "stat-3", "stat-4"].map((key) => (
          <div
            key={key}
            className="bg-white rounded-xl p-6 shadow-sm"
            style={{ minHeight: "120px" }}
          >
            <Skeleton className="mb-4" height="h-8" width="w-8" />
            <Skeleton className="mb-2" height="h-6" width="w-20" />
            <Skeleton height="h-4" width="w-16" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, _i) => {
          const uniqueKey = `chart-skeleton-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <div
              key={uniqueKey}
              className="bg-white rounded-xl p-6 shadow-sm"
              style={{ minHeight: "320px" }}
            >
              <Skeleton className="mb-6" height="h-6" width="w-48" />
              <Skeleton height="h-64" />
            </div>
          );
        })}
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, _i) => {
          const uniqueKey = `action-skeleton-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <div
              key={uniqueKey}
              className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl p-6 opacity-60"
              style={{ minHeight: "160px" }}
            >
              <Skeleton className="mb-3 bg-white/30" height="h-8" width="w-8" />
              <Skeleton className="mb-2 bg-white/40" height="h-5" width="w-24" />
              <Skeleton className="mb-4 bg-white/30" height="h-4" width="w-32" />
              <Skeleton className="bg-white/20" height="h-10" width="w-28" />
            </div>
          );
        })}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, _i) => {
          const uniqueKey = `chart-skeleton-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <div
              key={uniqueKey}
              className="bg-white rounded-xl p-6 shadow-sm"
              style={{ minHeight: "320px" }}
            >
              <Skeleton className="mb-6" height="h-6" width="w-48" />
              <Skeleton height="h-64" />
            </div>
          );
        })}
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, _i) => {
          const uniqueKey = `action-skeleton-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <div
              key={uniqueKey}
              className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl p-6 opacity-60"
              style={{ minHeight: "160px" }}
            >
              <Skeleton className="mb-3 bg-white/30" height="h-8" width="w-8" />
              <Skeleton className="mb-2 bg-white/40" height="h-5" width="w-24" />
              <Skeleton className="mb-4 bg-white/30" height="h-4" width="w-32" />
              <Skeleton className="bg-white/20" height="h-10" width="w-28" />
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

interface ChartSkeletonProps {
  height?: string;
}

export const ChartSkeleton = ({ height = "h-64" }: ChartSkeletonProps) => (
  <div className={`${height} flex items-end justify-between px-4 space-x-2`}>
    {Array.from({ length: 12 }).map((_, i) => {
      const uniqueKey = `chart-bar-${i}-${Math.random().toString(36).substr(2, 9)}`;
      return (
        <motion.div
          key={uniqueKey}
          className="bg-gray-200 rounded-t"
          style={{
            width: "100%",
            height: `${Math.random() * 60 + 20}%`,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        />
      );
    })}
  </div>
);
