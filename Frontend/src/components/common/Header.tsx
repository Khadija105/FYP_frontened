import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  useDarkMode,
  useLanguage,
  useTranslation,
} from "../../hooks";
import { useAuthStore } from "../../store";
import { Button } from "../ui";

export const Header: React.FC = () => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
    { code: "hi", label: "हिन्दी" },
    { code: "ar", label: "العربية" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Artellect
          </motion.div>
        </Link>

        {/* Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 dark:text-gray-200">
          <motion.div whileHover={{ color: "#6366f1" }} className="cursor-pointer">
            <Link to="/browse">{t("browse")}</Link>
          </motion.div>
          <motion.div whileHover={{ color: "#6366f1" }} className="cursor-pointer">
            <Link to="/chat">{t("chatAI")}</Link>
          </motion.div>
          {isAuthenticated && (
            <>
              <motion.div whileHover={{ color: "#6366f1" }} className="cursor-pointer">
                <Link to="/dashboard">{t("dashboard")}</Link>
              </motion.div>
              <motion.div whileHover={{ color: "#6366f1" }} className="cursor-pointer">
                <Link to="/cart">{t("cart")}</Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Language Dropdown */}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              {language.toUpperCase()}
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full hidden group-hover:block bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-2 mt-2 w-40"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-3 py-2 rounded text-gray-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all ${
                    language === lang.code ? "bg-indigo-100 dark:bg-indigo-900" : ""
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            {isDark ? "☀️" : "🌙"}
          </motion.button>

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">{t("signup")}</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={user?.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer border-2 border-indigo-600"
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1 text-xl"
              >
                ☰
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 dark:bg-dark-card border-t border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4">{t("about")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("aboutUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("careers")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("press")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4">{t("support")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("helpCenter")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("contactUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("faq")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4">{t("legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("privacy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("terms")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("cookies")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4">{t("follow")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("twitter")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("instagram")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-all">
                  {t("discord")}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-border pt-8 text-center text-sm">
          <p>&copy; 2024 Artellect AI. {t("allRightsReserved")}</p>
        </div>
      </div>
    </motion.footer>
  );
};
