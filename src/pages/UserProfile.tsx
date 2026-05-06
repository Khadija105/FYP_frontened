import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Card } from "../components/ui";
import { useTranslation } from "../hooks";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  followers: number;
  following: number;
  isArtist: boolean;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserData>({
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    bio: "Digital artist and collector",
    location: "San Francisco, CA",
    website: "https://johndoe.com",
    joinDate: "January 2024",
    followers: 234,
    following: 156,
    isArtist: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    setUser(formData);
    setEditMode(false);
  };

  return (
    <MainLayout>
      <PageContainer className="pt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <Card className="mb-8 p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={formData.avatar}
                alt={formData.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-600"
              />

              {/* User Info */}
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      placeholder={t("name")}
                    />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 min-h-20"
                      placeholder={t("bio")}
                    />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      placeholder={t("location")}
                    />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      placeholder="Website"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {user.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>📍 {user.location}</p>
                      <p>🌐 {user.website}</p>
                      <p>📅 {t("joined")} {user.joinDate}</p>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  {editMode ? (
                    <>
                      <Button onClick={handleSave} variant="primary">
                        {t("saveChanges")}
                      </Button>
                      <Button onClick={() => setEditMode(false)} variant="secondary">
                        {t("cancel")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setEditMode(true)} variant="primary">
                        {t("editProfile")}
                      </Button>
                      <Button
                        onClick={() => navigate("/settings")}
                        variant="secondary"
                      >
                        {t("settings")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center p-6">
                <p className="text-3xl font-bold text-indigo-600">{user.followers}</p>
                <p className="text-gray-600 dark:text-gray-400">{t("followers")}</p>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center p-6">
                <p className="text-3xl font-bold text-indigo-600">{user.following}</p>
                <p className="text-gray-600 dark:text-gray-400">{t("following")}</p>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="text-center p-6">
                <p className="text-3xl font-bold text-indigo-600">12</p>
                <p className="text-gray-600 dark:text-gray-400">{t("favorites")}</p>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t("recentActivity")}
            </h2>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300">Added "Abstract Sunset" to favorites</p>
                <p className="ml-auto text-sm text-gray-500">2 hours ago</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300">Followed artist Jane Smith</p>
                <p className="ml-auto text-sm text-gray-500">1 day ago</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300">Purchased "Digital Canvas" artwork</p>
                <p className="ml-auto text-sm text-gray-500">3 days ago</p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </PageContainer>
    </MainLayout>
  );
};

export default UserProfile;
