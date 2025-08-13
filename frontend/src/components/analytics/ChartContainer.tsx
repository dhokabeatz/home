import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  description?: string;
  className?: string;
}

export default function ChartContainer({
  title,
  children,
  loading = false,
  onRefresh,
  description,
  className = "",
}: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
        <div className="flex-1 min-w-0 mb-3 sm:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 flex-shrink-0 self-start"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {loading ? "Loading..." : "Refresh"}
            </span>
          </button>
        )}
      </div>

      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        {loading ? (
          <div className="h-56 sm:h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
