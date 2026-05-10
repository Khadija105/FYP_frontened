import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Card } from "../components/ui";
import { useTranslation } from "../hooks";
import { useAuthStore } from "../store";
import { userAPI, type UserProfile as UserProfileT } from "../services/api";

interface ActivityItem {
  type: string;
  title: string;
  id: string;
  timestamp?: string;
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";

const relativeFromNow = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  return date.toLocaleDateString();
};

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bootstrapping = useAuthStore((s) => s.bootstrapping);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const [profile, setProfile] = useState<UserProfileT | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfileT>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bootstrapping) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [p, a] = await Promise.all([userAPI.getProfile(), userAPI.getActivity()]);
        if (cancelled) return;
        setProfile(p);
        setFormData(p);
        setActivity(a as ActivityItem[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, bootstrapping, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await userAPI.updateProfile({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        avatar: formData.avatar,
      });
      setProfile(updated);
      setFormData(updated);
      setEditMode(false);
      await refreshUser();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <p className="text-gray-600 dark:text-gray-400">{loading ? "Loading profile…" : error}</p>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer className="pt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="mb-8 p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={formData.avatar || profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-600"
              />
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name ?? ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      placeholder={t("name")}
                    />
                    <textarea
                      name="bio"
                      value={formData.bio ?? ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 min-h-20"
                      placeholder={t("bio")}
                    />
                    <input
                      type="text"
                      name="location"
                      value={formData.location ?? ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      placeholder={t("location")}
                    />
                    <input
                      type="url"
                      name="website"
                      value={formData.website ?? ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      placeholder="Website"
                    />
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar ?? ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      placeholder="Avatar URL"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {profile.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{profile.bio || "No bio yet."}</p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {profile.location && <p>📍 {profile.location}</p>}
                      {profile.website && (
                        <p>
                          🌐{" "}
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-500 hover:underline"
                          >
                            {profile.website}
                          </a>
                        </p>
                      )}
                      <p>📅 {t("joined")} {formatDate(profile.createdAt)}</p>
                    </div>
                  </>
                )}

                <div className="flex gap-3 mt-6">
                  {editMode ? (
                    <>
                      <Button onClick={handleSave} variant="primary" isLoading={saving}>
                        {t("saveChanges")}
                      </Button>
                      <Button
                        onClick={() => {
                          setFormData(profile);
                          setEditMode(false);
                          setError(null);
                        }}
                        variant="secondary"
                      >
                        {t("cancel")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setEditMode(true)} variant="primary">
                        {t("editProfile")}
                      </Button>
                      <Button onClick={() => navigate("/settings")} variant="secondary">
                        {t("settings")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="text-center p-6">
              <p className="text-3xl font-bold text-indigo-600">{profile.followers}</p>
              <p className="text-gray-600 dark:text-gray-400">{t("followers")}</p>
            </Card>
            <Card className="text-center p-6">
              <p className="text-3xl font-bold text-indigo-600">{profile.following}</p>
              <p className="text-gray-600 dark:text-gray-400">{t("following")}</p>
            </Card>
            <Card className="text-center p-6">
              <p className="text-3xl font-bold text-indigo-600">{profile.favorites}</p>
              <p className="text-gray-600 dark:text-gray-400">{t("favorites")}</p>
            </Card>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("recentActivity")}
            </h2>
            {activity.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No activity yet.</p>
            ) : (
              <div className="space-y-4">
                {activity.slice(0, 8).map((item, idx) => (
                  <motion.div
                    key={`${item.type}-${item.id}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                    <p className="text-gray-700 dark:text-gray-300">
                      {item.type === "favorite" && `Liked "${item.title}"`}
                      {item.type === "follow" && `Followed ${item.title}`}
                      {item.type === "purchase" && `Purchased ${item.title}`}
                    </p>
                    <p className="ml-auto text-sm text-gray-500">
                      {relativeFromNow(item.timestamp)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </PageContainer>
    </MainLayout>
  );
};

export default UserProfile;
