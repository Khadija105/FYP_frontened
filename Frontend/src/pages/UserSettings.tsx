import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Card } from "../components/ui";
import { useTranslation } from "../hooks";
import { useThemeStore, useAuthStore } from "../store";
import { userAPI, authAPI } from "../services/api";

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  privateProfile: boolean;
  twoFactorAuth: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
}

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const { isAuthenticated, bootstrapping } = useAuthStore();

  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    privateProfile: false,
    twoFactorAuth: false,
    theme: isDark ? "dark" : "light",
    language: "en",
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bootstrapping) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const loadSettings = async () => {
      try {
        const userSettings = await userAPI.getSettings();
        setSettings(userSettings);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [isAuthenticated, bootstrapping, navigate]);

  const handleToggle = (key: keyof Settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    if (key === "theme") {
      if (newSettings.theme === "auto") {
        newSettings.theme = "light";
      } else if (newSettings.theme === "light") {
        newSettings.theme = "dark";
      } else {
        newSettings.theme = "auto";
      }
    }
    setSettings(newSettings);
  };

  const handleThemeChange = (theme: "light" | "dark" | "auto") => {
    setSettings({ ...settings, theme });
    if (theme === "dark" && !isDark) {
      toggleTheme();
    } else if (theme === "light" && isDark) {
      toggleTheme();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await userAPI.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await authAPI.deleteAccount();
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete account");
    }
  };

  const settingSections = [
    {
      title: t("notifications"),
      settings: [
        {
          label: t("emailNotifications"),
          description: "Receive updates via email",
          key: "emailNotifications" as const,
        },
        {
          label: t("pushNotifications"),
          description: "Receive push notifications",
          key: "pushNotifications" as const,
        },
        {
          label: t("marketingEmails"),
          description: "Receive promotional content",
          key: "marketingEmails" as const,
        },
      ],
    },
    {
      title: t("privacy"),
      settings: [
        {
          label: t("privateProfile"),
          description: "Make your profile private",
          key: "privateProfile" as const,
        },
        {
          label: t("twoFactorAuth"),
          description: "Add extra security to your account",
          key: "twoFactorAuth" as const,
        },
      ],
    },
  ];

  return (
    <MainLayout>
      <PageContainer className="pt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
            >
              {t("backToProfile")}
            </motion.button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t("settings")}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your account preferences and privacy
            </p>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200"
            >
              ✗ {error}
            </motion.div>
          )}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200"
            >
              ✓ {t("settingsSaved")}
            </motion.div>
          )}

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
            </div>
          )}

          {/* Theme Settings */}
          <Card className="mb-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("appearance")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("theme")}
                </label>
                <div className="flex gap-4">
                  {(["light", "dark", "auto"] as const).map((theme) => (
                    <motion.button
                      key={theme}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleThemeChange(theme)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        settings.theme === theme
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {theme}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full md:w-48 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Settings Sections */}
          {settingSections.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
              className="mb-6"
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {setting.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {setting.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle(setting.key)}
                        className={`relative inline-flex h-8 w-14 rounded-full transition-all ${
                          settings[setting.key] ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform m-1 ${
                            settings[setting.key] ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Danger Zone */}
          <Card className="p-8 border-2 border-red-200 dark:border-red-900/50">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">
              Danger Zone
            </h2>
            <div className="space-y-4">
              <Button variant="secondary" className="w-full">
                Download My Data
              </Button>
              <Button
                variant="secondary"
                className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 border border-red-200 dark:border-red-800"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </Card>

          {/* Save Button */}
          {!loading && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSave}
                variant="primary"
                size="lg"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          )}
        </motion.div>
      </PageContainer>
    </MainLayout>
  );
};

export default UserSettings;
