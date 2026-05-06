import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Badge } from "../components/ui";
import { ArtworkCard } from "../components/common/Cards";
import { artworkAPI } from "../services/api";
import { useCartStore } from "../store";
import { MOCK_ARTWORKS } from "../data/mockData";
import { Artwork, Comment } from "../types";

const ArtworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [artwork, setArtwork] = useState<Artwork | null>(
    MOCK_ARTWORKS.find((a) => a.id === id) || null
  );
  const [relatedArtworks, setRelatedArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(!artwork);
  const [likes, setLikes] = useState(artwork?.likes || 0);
  const [userLiked, setUserLiked] = useState(artwork?.userLiked || false);
  const [comments, setComments] = useState<Comment[]>(artwork?.comments || []);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const loadArtwork = async () => {
      if (id) {
        const art = await artworkAPI.getById(id);
        setArtwork(art);
        setLikes(art?.likes || 0);
        setUserLiked(art?.userLiked || false);
        setComments(art?.comments || []);

        if (art) {
          const related = await artworkAPI.getAll({
            category: art.category,
          });
          setRelatedArtworks(
            related.filter((a) => a.id !== id).slice(0, 4)
          );
        }
      }
      setLoading(false);
    };

    loadArtwork();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <p>Loading...</p>
        </PageContainer>
      </MainLayout>
    );
  }

  if (!artwork) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <p>Artwork not found</p>
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
                onClick={() => {
                  setUserLiked(!userLiked);
                  setLikes(userLiked ? likes - 1 : likes + 1);
                }}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-colors ${
                  userLiked
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
                  onClick={() => {
                    if (commentText.trim()) {
                      const newComment: Comment = {
                        id: Date.now().toString(),
                        username: "You",
                        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
                        text: commentText,
                        timestamp: new Date().toLocaleDateString(),
                        likes: 0,
                      };
                      setComments([newComment, ...comments]);
                      setCommentText("");
                    }
                  }}
                >
                  Post Comment
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
                  onClick={() => addToCart(artwork)}
                >
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="w-full">
                  Buy Now
                </Button>
              </div>
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
        </motion.div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
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
