import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button } from "../components/ui";
import { ArtworkCard } from "../components/common/Cards";
import { artistAPI } from "../services/api";
import { useAuthStore, useUIStore } from "../store";
import { Artist, Artwork } from "../types";

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followPending, setFollowPending] = useState(false);
  const { setFollowing } = useUIStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    let cancelled = false;
    const loadArtist = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const art = await artistAPI.getById(id);
        if (cancelled) return;
        setArtist(art);
        setIsFollowing(!!art?.followingStatus);
        if (art) {
          setFollowing(art.id, !!art.followingStatus);
          const arts = await artistAPI.getArtworks(id);
          if (!cancelled) setArtworks(arts);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadArtist();
    return () => {
      cancelled = true;
    };
  }, [id, setFollowing]);

  if (loading) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <p>Loading...</p>
        </PageContainer>
      </MainLayout>
    );
  }

  if (!artist) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <p>Artist not found</p>
        </PageContainer>
      </MainLayout>
    );
  }

  const handleFollow = async () => {
    if (!artist || followPending) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setFollowPending(true);
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowing(artist.id, next);
    try {
      const updated = next
        ? await artistAPI.follow(artist.id)
        : await artistAPI.unfollow(artist.id);
      setArtist(updated);
      setIsFollowing(!!updated.followingStatus);
      setFollowing(artist.id, !!updated.followingStatus);
    } catch (err) {
      setIsFollowing(!next);
      setFollowing(artist.id, !next);
      console.error("Follow toggle failed", err);
    } finally {
      setFollowPending(false);
    }
  };

  return (
    <MainLayout>
      <PageContainer className="pt-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden">
            <motion.div
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3), transparent)",
              }}
            />
          </div>

          {/* Profile Info */}
          <div className="relative -mt-16 px-6 sm:px-12 flex flex-col sm:flex-row sm:items-end sm:gap-6">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              src={artist.avatar}
              alt={artist.name}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-card shadow-lg"
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 sm:mb-0 flex-1"
            >
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {artist.name}
                </h1>
                {artist.isVerified && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-2xl"
                  >
                    ✓
                  </motion.span>
                )}
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {artist.followers.toLocaleString()} followers
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <Button
                size="lg"
                variant={isFollowing ? "secondary" : "primary"}
                onClick={handleFollow}
                isLoading={followPending}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button size="lg" variant="ghost">
                Message
              </Button>
            </motion.div>
          </div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 px-6 sm:px-12"
          >
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
              {artist.bio}
            </p>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 sm:gap-6 mb-12 py-6 border-y border-gray-200 dark:border-gray-700"
        >
          {[
            { label: "Artworks", value: artworks.length.toString() },
            { label: "Followers", value: (artist.followers / 1000).toFixed(1) + "K" },
            { label: "Total Sales", value: "$" + (artist.followers * 100).toLocaleString() },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stat.value}
              </p>
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Artworks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Collection
          </h2>

          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {artworks.map((artwork, idx) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <ArtworkCard artwork={artwork} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No artworks yet
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <h3 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-300">
              🏆 Achievements
            </h3>
            <ul className="space-y-2 text-indigo-800 dark:text-indigo-200">
              <li>✓ Verified Artist</li>
              <li>✓ Featured Artist</li>
              <li>✓ 15K+ Followers</li>
              <li>✓ Top Seller</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-2xl border border-purple-200 dark:border-purple-800">
            <h3 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-300">
              📞 Get In Touch
            </h3>
            <p className="text-purple-800 dark:text-purple-200 mb-4">
              For commissions, collaborations, or inquiries:
            </p>
            <Button variant="primary" className="w-full">
              Contact Artist
            </Button>
          </div>
        </motion.div>
      </PageContainer>
    </MainLayout>
  );
};

export default ArtistProfile;
