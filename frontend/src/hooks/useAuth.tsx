import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { apiService, User } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if isAuthenticated cookie exists (this one is not HTTP-only)
      const isAuth = document.cookie.includes("isAuthenticated=true");
      if (!isAuth) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try to get user profile, cookies will be sent automatically
      const profile = await apiService.getProfile();
      setUser(profile);
    } catch (error) {
      // User not authenticated or session expired
      console.log("Auth check failed - not authenticated:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const result = await apiService.login({ email: username, password });
      // Use the user data directly from login response instead of calling getProfile
      setUser(result.user);

      // Add a small delay to ensure cookies are fully processed
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
