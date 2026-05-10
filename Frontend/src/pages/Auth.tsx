import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input } from "../components/ui";
import { useTranslation } from "../hooks";
import { useAuthStore } from "../store";
import { getErrorMessage } from "../utils/errors";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = t("emailRequired");
    else if (!email.includes("@")) newErrors.email = t("emailInvalid") || "Invalid email";
    if (!password) newErrors.password = t("passwordRequired");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGeneralError(null);
      return;
    }

    setIsLoading(true);
    setGeneralError(null);
    try {
      await login(email.toLowerCase(), password);
      navigate("/browse");
    } catch (error) {
      const message = getErrorMessage(error);
      setGeneralError(message);
      setErrors({});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-dark-bg flex items-center justify-center p-4">
      {/* Background Animation */}
      <motion.div className="absolute inset-0 opacity-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-500"
            animate={{
              x: Math.sin(i) * 100,
              y: Math.cos(i) * 100,
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("welcomeBack")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("signInAccount")}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-800 dark:text-red-200 text-sm">{generalError}</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              label={t("email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@example.com"
              error={errors.email}
              icon="✉️"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              label={t("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              icon="🔒"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {t("signInButton")}
            </Button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            {t("noAccountQuestion")}{" "}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {t("createNow")}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const register = useAuthStore((state) => state.register);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t("nameRequired") || "Name is required";
    if (!formData.email) newErrors.email = t("emailRequired");
    else if (!formData.email.includes("@")) newErrors.email = t("emailInvalid") || "Invalid email";
    if (!formData.password) newErrors.password = t("passwordRequired");
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("passwordMismatch");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGeneralError(null);
      return;
    }

    setIsLoading(true);
    setGeneralError(null);
    try {
      await register(formData.name, formData.email.toLowerCase(), formData.password);
      navigate("/browse");
    } catch (error) {
      const message = getErrorMessage(error);
      setGeneralError(message);
      setErrors({});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-dark-bg flex items-center justify-center p-4">
      {/* Background Animation */}
      <motion.div className="absolute inset-0 opacity-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-500"
            animate={{
              x: Math.sin(i) * 100,
              y: Math.cos(i) * 100,
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("signUpTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("signUpSubtitle")}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-800 dark:text-red-200 text-sm">{generalError}</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              label={t("name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              error={errors.name}
              icon="👤"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              label={t("email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@example.com"
              error={errors.email}
              icon="✉️"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Input
              label={t("password")}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              icon="🔒"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Input
              label={t("confirmPassword")}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              icon="🔒"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {t("signUpButton")}
            </Button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            {t("alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {t("signInButton")}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export { Login, Register };
