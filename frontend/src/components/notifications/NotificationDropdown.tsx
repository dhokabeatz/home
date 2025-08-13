import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService, Notification, NotificationType } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      // Check user authentication
      loadNotifications(true);
    }
  }, [isOpen, user]);

  // Load unread count on component mount with a small delay for auth to settle
  useEffect(() => {
    if (!user) return; // Don't make API calls if user is not authenticated

    // Add a small delay to ensure authentication cookies are properly set
    const timeoutId = setTimeout(() => {
      loadUnreadCount();
    }, 500); // 500ms delay

    // Set up interval to refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [user]); // Add user as dependency

  const loadNotifications = async (reset = false) => {
    if (!user) {
      return; // Don't load anything if user is not authenticated
    }

    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;

      const response = await apiService.getNotifications({
        page: currentPage,
        limit: 10,
      });

      if (response.success) {
        const newNotifications = response.data.notifications;

        if (reset) {
          setNotifications(newNotifications);
          setPage(2);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setPage(currentPage + 1);
        }

        setHasMore(currentPage < response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) {
      return; // Don't load anything if user is not authenticated
    }

    try {
      const response = await apiService.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await apiService.markNotificationAsRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await apiService.deleteNotification(id);
      if (response.success) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        // Decrease unread count if the deleted notification was unread
        const deletedNotification = notifications.find((n) => n.id === id);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "SUCCESS":
        return "✅";
      case "WARNING":
        return "⚠️";
      case "ERROR":
        return "❌";
      case "CONTACT":
        return "📧";
      case "SYSTEM":
        return "⚙️";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "SUCCESS":
        return "border-l-green-500 bg-green-50";
      case "WARNING":
        return "border-l-yellow-500 bg-yellow-50";
      case "ERROR":
        return "border-l-red-500 bg-red-50";
      case "CONTACT":
        return "border-l-blue-500 bg-blue-50";
      case "SYSTEM":
        return "border-l-purple-500 bg-purple-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading notifications...</p>
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}

              {notifications.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-150 border-l-4 ${
                        !notification.isRead ? "bg-blue-25" : ""
                      } ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </span>
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => setIsOpen(false)}
                              >
                                View →
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete notification"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <div className="p-4 text-center">
                      <button
                        onClick={() => loadNotifications()}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {loading ? "Loading..." : "Load more"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
