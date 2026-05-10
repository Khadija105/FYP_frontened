import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Artwork } from "../../types";
import { artistAPI } from "../../services/api";
import { useAuthStore, useCartStore, useUIStore } from "../../store";
import { Button, Badge } from "../ui";

interface ArtworkCardProps {
  artwork: Artwork;
  showDetails?: boolean;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  showDetails = false,
}) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
        <motion.img
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          src={artwork.image}
          alt={artwork.title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => navigate(`/artwork/${artwork.id}`)}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 flex items-end p-4"
        >
          <div className="w-full flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/artwork/${artwork.id}`)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => addToCart(artwork)}
            >
              Add to Cart
            </Button>
          </div>
        </motion.div>

        {/* Price Badge */}
        <motion.div className="absolute top-3 right-3">
          <Badge variant="primary">${artwork.price.toLocaleString()}</Badge>
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div className="mt-3">
        <h3 className="font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          onClick={() => navigate(`/artwork/${artwork.id}`)}>
          {artwork.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={artwork.artist.avatar}
            alt={artwork.artist.name}
            className="w-6 h-6 rounded-full cursor-pointer"
            onClick={() => navigate(`/artist/${artwork.artist.id}`)}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {artwork.artist.name}
          </span>
          {artwork.artist.isVerified && <span className="text-indigo-600">✓</span>}
        </div>

        {/* Tags */}
        {showDetails && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {artwork.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>❤️ {artwork.likes.toLocaleString()}</span>
          <span>{artwork.category}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`bg-white dark:bg-dark-card rounded-xl ${sizeClasses[size]} w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ArtistCard: React.FC<{ artist: any }> = ({ artist }) => {
  const navigate = useNavigate();
  const { isArtistFollowing, setFollowing } = useUIStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialFollow = isArtistFollowing[artist.id] ?? !!artist.followingStatus;
  const [isFollowing, setIsFollowing] = useState<boolean>(initialFollow);
  const [pending, setPending] = useState(false);

  const handleFollow = async () => {
    if (pending) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowing(artist.id, next);
    setPending(true);
    try {
      const result = next
        ? await artistAPI.follow(artist.id)
        : await artistAPI.unfollow(artist.id);
      setIsFollowing(!!result.followingStatus);
      setFollowing(artist.id, !!result.followingStatus);
    } catch {
      setIsFollowing(!next);
      setFollowing(artist.id, !next);
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-dark-card rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border"
    >
      <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
      <div className="px-4 pb-4">
        <div className="flex flex-col items-center -mt-10 relative z-10">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={artist.avatar}
            alt={artist.name}
            className="w-24 h-24 rounded-full border-4 border-white dark:border-dark-card cursor-pointer"
            onClick={() => navigate(`/artist/${artist.id}`)}
          />
          <h3 className="mt-3 font-bold text-lg text-gray-900 dark:text-white flex items-center gap-1">
            {artist.name}
            {artist.isVerified && <span className="text-indigo-600">✓</span>}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {artist.followers.toLocaleString()} followers
          </p>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2 line-clamp-2">
          {artist.bio}
        </p>
        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/artist/${artist.id}`)}
          >
            View Profile
          </Button>
          <Button
            size="sm"
            className="flex-1"
            variant={isFollowing ? "secondary" : "primary"}
            onClick={handleFollow}
            isLoading={pending}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
