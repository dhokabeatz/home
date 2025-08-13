import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { CustomAlert, AlertData } from "../components/ui/CustomAlert";

interface AlertContextType {
  showAlert: (alert: Omit<AlertData, "id">) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (
    title: string,
    message: string,
    actions?: AlertData["actions"]
  ) => void;
  showWarning: (
    title: string,
    message: string,
    actions?: AlertData["actions"]
  ) => void;
  showInfo: (
    title: string,
    message: string,
    actions?: AlertData["actions"]
  ) => void;
  hideAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const generateId = () =>
    `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const showAlert = (alert: Omit<AlertData, "id">) => {
    const newAlert: AlertData = {
      ...alert,
      id: generateId(),
    };
    setAlerts((prev) => [...prev, newAlert]);
  };

  const showSuccess = (
    title: string,
    message: string,
    duration: number = 4000
  ) => {
    showAlert({
      type: "success",
      title,
      message,
      duration,
    });
  };

  const showError = (
    title: string,
    message: string,
    actions?: AlertData["actions"]
  ) => {
    showAlert({
      type: "error",
      title,
      message,
      actions,
    });
  };

  const showWarning = (
    title: string,
    message: string,
    actions?: AlertData["actions"]
  ) => {
    showAlert({
      type: "warning",
      title,
      message,
      actions,
    });
  };

  const showInfo = (
    title: string,
    message: string,
    actions?: AlertData["actions"]
  ) => {
    showAlert({
      type: "info",
      title,
      message,
      actions,
    });
  };

  const hideAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const contextValue = useMemo(
    () => ({
      showAlert,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      hideAlert,
    }),
    [showAlert, showSuccess, showError, showWarning, showInfo, hideAlert]
  );

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {/* Render alerts */}
      {alerts.map((alert) => (
        <CustomAlert key={alert.id} alert={alert} onClose={hideAlert} />
      ))}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
