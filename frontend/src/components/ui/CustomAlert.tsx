import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export interface AlertData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number; // Auto-close after milliseconds (optional)
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: "primary" | "secondary";
  }>;
}

interface CustomAlertProps {
  alert: AlertData;
  onClose: (id: string) => void;
}

export function CustomAlert({ alert, onClose }: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (alert.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, alert.duration);
      return () => clearTimeout(timer);
    }
  }, [alert.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(alert.id), 300); // Wait for animation
  };

  const getIcon = () => {
    switch (alert.type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getColorClasses = () => {
    switch (alert.type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <button
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity w-full h-full border-none cursor-pointer"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
        aria-label="Close alert"
      ></button>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md rounded-lg border shadow-lg transition-all duration-300 ${
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          } ${getColorClasses()}`}
        >
          {/* Header */}
          <div className="flex items-start p-6">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {alert.title}
              </h3>
              <p className="mt-2 text-sm text-gray-700">{alert.message}</p>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          {alert.actions && alert.actions.length > 0 && (
            <div className="flex items-center justify-end px-6 py-4 bg-gray-50 rounded-b-lg gap-3">
              {alert.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.action();
                    handleClose();
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    action.variant === "primary"
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
