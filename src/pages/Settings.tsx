import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";

interface SettingsData {
  // Notifications
  email_notifications: boolean;
  push_notifications: boolean;
  project_updates: boolean;
  message_notifications: boolean;
  payment_notifications: boolean;

  // Privacy
  profile_visibility: "public" | "private" | "freelancers_only";
  show_online_status: boolean;
  allow_messages: boolean;

  // Appearance
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;

  // Security
  two_factor_enabled: boolean;
  session_timeout: number;
}

export function Settings() {
  const { profile, signOut } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({
    email_notifications: true,
    push_notifications: true,
    project_updates: true,
    message_notifications: true,
    payment_notifications: true,
    profile_visibility: "public",
    show_online_status: true,
    allow_messages: true,
    theme: "system",
    language: "en",
    timezone: "UTC",
    two_factor_enabled: false,
    session_timeout: 30,
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Mock settings load - replace with real Supabase query
    // For now, using default values
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Mock save - replace with real Supabase update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Mock password change - replace with real Supabase auth update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordData({ current: "", new: "", confirm: "" });
      // Show success message
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // Mock account deletion - replace with real Supabase delete
      await new Promise((resolve) => setTimeout(resolve, 1000));
      signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SettingsData, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">
                Email Notifications
              </label>
              <p className="text-sm text-gray-600">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) =>
                  updateSetting("email_notifications", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">
                Push Notifications
              </label>
              <p className="text-sm text-gray-600">
                Receive push notifications in your browser
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.push_notifications}
                onChange={(e) =>
                  updateSetting("push_notifications", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">
                Project Updates
              </label>
              <p className="text-sm text-gray-600">
                Get notified about project status changes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.project_updates}
                onChange={(e) =>
                  updateSetting("project_updates", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">
                Message Notifications
              </label>
              <p className="text-sm text-gray-600">
                Get notified about new messages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.message_notifications}
                onChange={(e) =>
                  updateSetting("message_notifications", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">
                Payment Notifications
              </label>
              <p className="text-sm text-gray-600">
                Get notified about payments and invoices
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payment_notifications}
                onChange={(e) =>
                  updateSetting("payment_notifications", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profile_visibility}
              onChange={(e) =>
                updateSetting("profile_visibility", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="public">
                Public - Anyone can see your profile
              </option>
              <option value="freelancers_only">
                Freelancers Only - Only freelancers can see your profile
              </option>
              <option value="private">
                Private - Only you can see your profile
              </option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">
                Show Online Status
              </label>
              <p className="text-sm text-gray-600">
                Let others see when you're online
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_online_status}
                onChange={(e) =>
                  updateSetting("show_online_status", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">
                Allow Direct Messages
              </label>
              <p className="text-sm text-gray-600">
                Let others send you direct messages
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_messages}
                onChange={(e) =>
                  updateSetting("allow_messages", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => updateSetting("theme", "light")}
                className={`p-3 border rounded-lg flex items-center space-x-2 ${
                  settings.theme === "light"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => updateSetting("theme", "dark")}
                className={`p-3 border rounded-lg flex items-center space-x-2 ${
                  settings.theme === "dark"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => updateSetting("theme", "system")}
                className={`p-3 border rounded-lg flex items-center space-x-2 ${
                  settings.theme === "system"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-sm">System</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting("language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">Greenwich Mean Time</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Change Password */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                />
              </div>

              <Button onClick={changePassword} disabled={loading}>
                Change Password
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.two_factor_enabled}
                  onChange={(e) =>
                    updateSetting("two_factor_enabled", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={settings.session_timeout}
              onChange={(e) =>
                updateSetting("session_timeout", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Delete Account</h3>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={deleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading} size="lg">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
