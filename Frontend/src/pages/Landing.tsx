import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, SkeletonLoader } from "../components/ui";
import { useTranslation } from "../hooks";
import { useAsync } from "../hooks/useAsync";
import { ArtworkCard } from "../components/common/Cards";
import { artworkAPI } from "../services/api";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch featured artworks
  const { data: featured, loading: featuredLoading } = useAsync(
    () => artworkAPI.getFeatured(),
    [],
    { autoFetch: true }
  );
  const featuredArtworks = featured ?? [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-indigo-900 via-purple-900 to-dark-bg overflow-hidden flex items-center">
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 50%)",
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["100% 100%", "0% 0%"],
          }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 80%, #6366f1 0%, transparent 50%)",
          }}
        />

        <PageContainer className="relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl"
          >
            {/* Main Title */}
            <motion.div variants={itemVariants} className="mb-6">
              <motion.h1
                className="text-6xl md:text-7xl font-bold text-white mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {t("discoverExtraordinary")}
              </motion.h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-300 mb-8"
            >
              {t("exploreArtworks")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() => navigate("/browse")}
                className="px-8"
              >
                {t("browseGallery")} →
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate("/chat")}
                className="px-8"
              >
                {t("askAIAssistant")}
              </Button>
            </motion.div>

            {/* Floating Cards Animation */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 mt-12 md:mt-16 max-w-2xl mx-auto"
            >
              {[
                { number: "5K+", label: t("artworks") },
                { number: "2K+", label: t("artists") },
                { number: "$10M", label: t("traded") },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="p-4 bg-white/10 backdrop-blur border border-white/20 rounded-lg"
                >
                  <div className="text-2xl font-bold text-cyan-400">{stat.number}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* Featured Artworks Section */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t("featuredCollection")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {t("handPickedArtworks")}
            </p>
          </motion.div>

          {featuredLoading ? (
            <SkeletonLoader count={6} />
          ) : featuredArtworks.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {featuredArtworks.map((artwork) => (
                  <motion.div key={artwork.id} variants={itemVariants}>
                    <ArtworkCard artwork={artwork} showDetails />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-12"
              >
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => navigate("/browse")}
                >
                  {t("viewAllArtworks")} →
                </Button>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">{t("noArtworks")}</p>
            </div>
          )}
        </PageContainer>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-dark-card dark:to-dark-bg">
        <PageContainer>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            {t("whyChooseArtellect")}
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "🎨",
                title: t("curatedCollection"),
                description: t("curatedCollectionDesc"),
              },
              {
                icon: "🤖",
                title: t("aiAssistant"),
                description: t("aiAssistantDesc"),
              },
              {
                icon: "🛡️",
                title: t("securePlatform"),
                description: t("securePlatformDesc"),
              },
              {
                icon: "🌍",
                title: t("globalCommunity"),
                description: t("globalCommunityDesc"),
              },
              {
                icon: "💎",
                title: t("premiumQuality"),
                description: t("premiumQualityDesc"),
              },
              {
                icon: "⚡",
                title: t("fastCheckout"),
                description: t("fastCheckoutDesc"),
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="p-6 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("readyToExplore")}
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              {t("startYourCollection")}
            </p>
            <Button size="lg" onClick={() => navigate("/browse")} className="bg-white text-indigo-600 hover:bg-gray-100">
              {t("getStartedNow")} →
            </Button>
          </motion.div>
        </PageContainer>
      </section>
    </MainLayout>
  );
};

export default Landing;
