import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Bell, Shield, Globe, User, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { apiService, UserProfile, UserSettings } from "../../services/api";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile and settings on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, settingsData] = await Promise.all([
          apiService.getUserProfile(),
          apiService.getUserSettings(),
        ]);
        setUserProfile(profileData);
        setUserSettings(settingsData);
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "site", name: "Site Settings", icon: Globe },
  ];

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    setIsLoading(true);
    try {
      // Clean up empty strings to undefined for proper validation
      const updateData = {
        name: userProfile.name,
        location: userProfile.location || "",
        phone: userProfile.phone || "",
      };

      const updatedProfile = await apiService.updateUserProfile(updateData);
      setUserProfile(updatedProfile);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!userSettings) return;

    setIsLoading(true);
    try {
      const updatedSettings = await apiService.updateUserSettings({
        emailNotifications: userSettings.emailNotifications,
        browserNotifications: userSettings.browserNotifications,
        newContactMessages: userSettings.newContactMessages,
        projectViews: userSettings.projectViews,
        weeklyReports: userSettings.weeklyReports,
        securityAlerts: userSettings.securityAlerts,
        maintenanceMode: userSettings.maintenanceMode,
        analyticsEnabled: userSettings.analyticsEnabled,
        contactFormEnabled: userSettings.contactFormEnabled,
        seoTitle: userSettings.seoTitle || "",
        seoDescription: userSettings.seoDescription || "",
        githubUrl: userSettings.githubUrl || "",
        linkedinUrl: userSettings.linkedinUrl || "",
        twitterUrl: userSettings.twitterUrl || "",
        emailUrl: userSettings.emailUrl || "",
        twoFactorEnabled: userSettings.twoFactorEnabled,
        loginAlerts: userSettings.loginAlerts,
      });
      setUserSettings(updatedSettings);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile = await apiService.uploadUserAvatar(file);
      setUserProfile(updatedProfile.user);
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    if (!file) return;

    // Validate file type and size
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("PDF size must be less than 20MB");
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile = await apiService.uploadUserCV(file);
      setUserProfile(updatedProfile.user);
      toast.success("CV updated successfully");
    } catch (error) {
      console.error("Failed to upload CV:", error);
      toast.error("Failed to upload CV");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    if (userProfile) {
      setUserProfile((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const updateSettings = (field: keyof UserSettings, value: any) => {
    if (userSettings) {
      setUserSettings((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const updateSocialLinks = (
    platform: "githubUrl" | "linkedinUrl" | "twitterUrl" | "emailUrl",
    value: string
  ) => {
    if (userSettings) {
      setUserSettings((prev) =>
        prev
          ? {
              ...prev,
              [platform]: value,
            }
          : null
      );
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile || !userSettings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Failed to load user data. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account, notifications, and site preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Profile Information
                  </h2>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex items-center space-x-6">
                    <img
                      src={
                        userProfile.avatar ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&auto=format"
                      }
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Change Avatar
                      </button>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={userProfile.name}
                      onChange={(e) => updateProfile("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={userProfile.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed here
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Location/Address
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      autoComplete="street-address"
                      value={userProfile.location || ""}
                      onChange={(e) =>
                        updateProfile("location", e.target.value)
                      }
                      placeholder="City, Country (used for contact info)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={userProfile.phone || ""}
                      onChange={(e) => updateProfile("phone", e.target.value)}
                      placeholder="+233 24 123 4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="cv-upload"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      CV/Resume
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
                      <input
                        id="cv-upload"
                        ref={cvFileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCVUpload(file);
                        }}
                        className="hidden"
                      />
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          {userProfile.cvUrl ? (
                            <span className="text-green-600 font-medium">
                              ✓ CV uploaded
                            </span>
                          ) : (
                            "Upload your CV/Resume"
                          )}
                        </p>
                        <button
                          onClick={() => cvFileInputRef.current?.click()}
                          disabled={isLoading}
                          className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {userProfile.cvUrl ? "Replace CV" : "Upload CV"}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF up to 20MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notification Preferences
                  </h2>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      label: "Email Notifications",
                      desc: "Receive notifications via email",
                    },
                    {
                      key: "browserNotifications",
                      label: "Browser Notifications",
                      desc: "Show desktop notifications in your browser",
                    },
                    {
                      key: "newContactMessages",
                      label: "New Contact Messages",
                      desc: "Get notified when someone sends a message",
                    },
                    {
                      key: "projectViews",
                      label: "Project Views",
                      desc: "Receive updates when projects are viewed",
                    },
                    {
                      key: "weeklyReports",
                      label: "Weekly Reports",
                      desc: "Get weekly analytics and performance reports",
                    },
                    {
                      key: "securityAlerts",
                      label: "Security Alerts",
                      desc: "Important security and login notifications",
                    },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3 border-b border-gray-100"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {label}
                        </h3>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <span className="sr-only">{label}</span>
                        <input
                          type="checkbox"
                          checked={
                            userSettings[key as keyof UserSettings] as boolean
                          }
                          onChange={(e) =>
                            updateSettings(
                              key as keyof UserSettings,
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Security Settings
                  </h2>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                        onClick={handleSaveSettings}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          userSettings.twoFactorEnabled
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-primary-600 text-white hover:bg-primary-700"
                        }`}
                      >
                        {userSettings.twoFactorEnabled
                          ? "Disable 2FA"
                          : "Enable 2FA"}
                      </button>
                    </div>
                    {!userSettings.twoFactorEnabled && (
                      <div className="flex items-center text-sm text-amber-600">
                        <Shield className="h-4 w-4 mr-2" />
                        Two-factor authentication is disabled
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Password
                        </h3>
                        <p className="text-sm text-gray-500">
                          Last changed:{" "}
                          {new Date(
                            userSettings.passwordLastChanged
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        Change Password
                      </button>
                    </div>

                    {showPasswordForm && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Current Password
                          </label>
                          <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            autoComplete="current-password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            New Password
                          </label>
                          <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Confirm New Password
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handlePasswordChange}
                            disabled={isLoading}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {isLoading ? "Changing..." : "Change Password"}
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Login Alerts
                        </h3>
                        <p className="text-sm text-gray-500">
                          Get notified about new logins to your account
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <span className="sr-only">Login Alerts</span>
                        <input
                          type="checkbox"
                          checked={userSettings.loginAlerts}
                          onChange={(e) =>
                            updateSettings("loginAlerts", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Active Sessions
                        </h3>
                        <p className="text-sm text-gray-500">
                          You have {userSettings.activeSessions} active session
                          {userSettings.activeSessions !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        aria-label="Revoke all active sessions"
                      >
                        Revoke All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Site Settings */}
            {activeTab === "site" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Site Settings
                  </h2>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      General
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Maintenance Mode
                          </h4>
                          <p className="text-sm text-gray-500">
                            Temporarily disable public access to your site
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <span className="sr-only">Maintenance Mode</span>
                          <input
                            id="maintenance-mode"
                            name="maintenanceMode"
                            type="checkbox"
                            checked={userSettings.maintenanceMode}
                            onChange={(e) =>
                              updateSettings(
                                "maintenanceMode",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      SEO
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="seoTitle"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Site Title
                        </label>
                        <input
                          id="seoTitle"
                          name="seoTitle"
                          type="text"
                          autoComplete="off"
                          value={userSettings.seoTitle || ""}
                          onChange={(e) =>
                            updateSettings("seoTitle", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="seoDescription"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Meta Description
                        </label>
                        <textarea
                          id="seoDescription"
                          name="seoDescription"
                          rows={3}
                          autoComplete="off"
                          value={userSettings.seoDescription || ""}
                          onChange={(e) =>
                            updateSettings("seoDescription", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Social Links
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="github"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          GitHub
                        </label>
                        <input
                          id="github"
                          name="githubUrl"
                          type="url"
                          autoComplete="url"
                          value={userSettings.githubUrl || ""}
                          onChange={(e) =>
                            updateSocialLinks("githubUrl", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="social-email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email
                        </label>
                        <input
                          id="social-email"
                          name="emailUrl"
                          type="email"
                          autoComplete="email"
                          value={userSettings.emailUrl || ""}
                          onChange={(e) =>
                            updateSocialLinks("emailUrl", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="linkedin"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          LinkedIn
                        </label>
                        <input
                          id="linkedin"
                          name="linkedinUrl"
                          type="url"
                          autoComplete="url"
                          value={userSettings.linkedinUrl || ""}
                          onChange={(e) =>
                            updateSocialLinks("linkedinUrl", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="twitter"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Twitter
                        </label>
                        <input
                          id="twitter"
                          name="twitterUrl"
                          type="url"
                          autoComplete="url"
                          value={userSettings.twitterUrl || ""}
                          onChange={(e) =>
                            updateSocialLinks("twitterUrl", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
