import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  suffix?: string;
  loading?: boolean;
  description?: string;
}

export default function AnalyticsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  suffix = "",
  loading = false,
  description,
}: AnalyticsCardProps) {
  const isPositive = change && change >= 0;
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className={`p-3 rounded-lg ${color} opacity-30`}>
            <div className="h-6 w-6 bg-white/30 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1 font-medium truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {displayValue}
            <span className="text-base sm:text-lg text-gray-500">{suffix}</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {change !== undefined && (
              <div
                className={`flex items-center text-sm font-medium mb-1 sm:mb-0 ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1 flex-shrink-0" />
                )}
                {Math.abs(change).toFixed(1)}%
                <span className="text-gray-500 ml-1 hidden sm:inline">
                  vs last period
                </span>
              </div>
            )}

            {description && (
              <p className="text-xs text-gray-500 truncate" title={description}>
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="ml-3 sm:ml-4 flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 sm:p-4 rounded-xl ${color} shadow-lg`}
          >
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
