import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Badge, Button, SkeletonLoader } from "../components/ui";
import { ArtworkCard } from "../components/common/Cards";
import { artworkAPI } from "../services/api";
import { useAuthStore, useCartStore } from "../store";
import { useAsync, useMutation } from "../hooks/useAsync";
import { getErrorMessage } from "../utils/errors";
import { Comment } from "../types";

const ArtworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch artwork
  const {
    data: artwork,
    loading: artworkLoading,
    error: artworkError,
  } = useAsync(
    () => (id ? artworkAPI.getById(id) : Promise.resolve(null)),
    [id],
    {
      autoFetch: true,
      onSuccess: (data) => {
        if (data) {
          setLikes(data.likes || 0);
          setUserLiked(!!data.userLiked);
          setComments(data.comments || []);
        }
      },
    }
  );

  // Fetch related artworks
  const {
    data: relatedArtworks = [],
  } = useAsync(
    () => (artwork ? artworkAPI.getAll({ category: artwork.category }) : Promise.resolve([])),
    [artwork?.category],
    { autoFetch: true }
  );

  // Like artwork mutation
  const { mutate: toggleLike, loading: likePending } = useMutation(
    (artworkId: string) => artworkAPI.toggleLike(artworkId),
    {
      onSuccess: (result) => {
        setUserLiked(result.liked);
        setLikes(result.likes);
      },
      onError: () => {
        setError("Failed to update like");
      },
    }
  );

  // Add comment mutation
  const { mutate: addComment, loading: commentPending } = useMutation(
    (payload: { artworkId: string; text: string }) =>
      artworkAPI.addComment(payload.artworkId, payload.text),
    {
      onSuccess: (comment) => {
        setComments([comment, ...comments]);
        setCommentText("");
        setError(null);
      },
      onError: (err) => {
        setError(getErrorMessage(err));
      },
    }
  );

  const handleLike = async () => {
    if (!artwork || likePending) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const prevLiked = userLiked;
    const prevLikes = likes;
    setUserLiked(!prevLiked);
    setLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);

    try {
      await toggleLike(artwork.id);
    } catch {
      setUserLiked(prevLiked);
      setLikes(prevLikes);
    }
  };

  const handleAddComment = async () => {
    if (!artwork || !commentText.trim() || commentPending) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addComment({ artworkId: artwork.id, text: commentText.trim() });
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  if (artworkLoading) {
    return (
      <MainLayout>
        <PageContainer className="pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonLoader count={1} />
            </div>
            <div className="lg:col-span-1">
              <SkeletonLoader count={3} />
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  if (artworkError || !artwork) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16"
          >
            <div className="text-6xl mb-4">🖼️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Artwork Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {artworkError || "The artwork you're looking for doesn't exist"}
            </p>
            <Button onClick={() => navigate("/browse")}>Browse Artworks</Button>
          </motion.div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700">
              <motion.img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handleLike}
                disabled={likePending}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-colors disabled:opacity-60 ${userLiked
                  ? "bg-red-500 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
              >
                {userLiked ? "❤️" : "🤍"}
              </motion.button>
            </div>

            {/* Story Section */}
            {artwork.story && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 space-y-4"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  The Story
                </h2>

                <motion.div
                  whileHover={{ borderColor: "#6366f1" }}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    Artist's Statement
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {artwork.story.statement}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ borderColor: "#6366f1" }}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    Creative Process
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {artwork.story.process}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ borderColor: "#6366f1" }}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    Inspiration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {artwork.story.inspiration}
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* YouTube Embed */}
            {artwork.youtubeUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Behind the Scenes
                </h2>
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={artwork.youtubeUrl}
                    title="Behind the Scenes"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Add Comment */}
              <motion.div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this artwork..."
                  className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-600"
                  rows={3}
                />
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={handleAddComment}
                  isLoading={commentPending}
                  disabled={!commentText.trim()}
                >
                  {isAuthenticated ? "Post Comment" : "Sign in to comment"}
                </Button>
              </motion.div>

              {/* Comments List */}
              <motion.div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={comment.avatar}
                          alt={comment.username}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {comment.username}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {comment.text}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            👍 {comment.likes}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            {/* Title and Price */}
            <motion.div
              whileHover={{ borderColor: "#6366f1" }}
              className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {artwork.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {artwork.description}
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${artwork.price.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    addToCart(artwork);
                    navigate("/cart");
                  }}
                >
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="w-full">
                  Buy Now
                </Button>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className={`p-3 rounded-full ${userLiked
                  ? "bg-red-500 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
            >
              {userLiked ? "❤️" : "🤍"}
            </motion.button>
          </motion.div>

          {/* Artist Section */}
          <motion.div
            whileHover={{ borderColor: "#6366f1", y: -4 }}
            className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all"
            onClick={() => navigate(`/artist/${artwork.artist.id}`)}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Created by
            </p>
            <div className="flex items-center gap-3 mb-3">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={artwork.artist.avatar}
                alt={artwork.artist.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  {artwork.artist.name}
                  {artwork.artist.isVerified && (
                    <span className="text-indigo-600">✓</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {artwork.artist.followers.toLocaleString()} followers
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {artwork.artist.bio}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/artist/${artwork.artist.id}`);
              }}
            >
              View Profile
            </Button>
          </motion.div>

          {/* Tags */}
          <motion.div
            whileHover={{ borderColor: "#6366f1" }}
            className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((tag) => (
                <Badge key={tag} variant="primary">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3"
          >
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Category
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {artwork.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Created
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(artwork.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Likes
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ❤️ {likes.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </motion.div>

      {/* Related Artworks */}
      {relatedArtworks && relatedArtworks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Related Artworks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArtworks.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        </motion.div>
      )}
      </PageContainer>
    </MainLayout>
  );
};

export default ArtworkDetail;
