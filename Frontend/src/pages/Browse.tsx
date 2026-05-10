import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Card, Input, Pagination, SkeletonLoader } from "../components/ui";
import { ArtworkCard } from "../components/common/Cards";
import { useTranslation } from "../hooks";
import { useAsync } from "../hooks/useAsync";
import { artworkAPI } from "../services/api";
import { CATEGORIES } from "../data/mockData";
import { Artwork } from "../types";

const Browse = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 12;

  // Fetch artworks with current filters
  const fetchArtworks = useCallback(async () => {
    try {
      let results: Artwork[] = [];

      if (searchQuery.trim()) {
        results = await artworkAPI.search(searchQuery);
      } else {
        results = await artworkAPI.getAll({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          priceRange: [priceRange[0], priceRange[1]],
          sortBy,
        });
      }

      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch artworks";
      setError(message);
      throw err;
    }
  }, [searchQuery, selectedCategory, selectedTags, priceRange, sortBy]);

  const { data: allArtworks, loading, error: fetchError } = useAsync(
    fetchArtworks,
    [selectedCategory, selectedTags, priceRange, sortBy, searchQuery],
    {
      autoFetch: true,
      onError: (err) => {
        console.error("Error fetching artworks:", err);
      },
    }
  );

  const artworks = allArtworks ?? [];

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setError(null);
  }, [selectedCategory, selectedTags, priceRange, sortBy, searchQuery]);

  const totalPages = Math.ceil(artworks.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedArtworks = artworks.slice(startIdx, startIdx + itemsPerPage);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Get unique tags from available artworks (sample)
  const allTags = Array.from(
    new Set(artworks.flatMap((art) => art.tags || []))
  )
    .filter((tag): tag is string => typeof tag === "string")
    .sort()
    .slice(0, 8);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedTags([]);
    setPriceRange([0, 10000]);
    setSortBy("trending");
    setSearchQuery("");
  };

  const displayError = error || fetchError;

  return (
    <MainLayout>
      <PageContainer className="pt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-8"
        >
          {t("browseArtworks")}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Search */}
            <Card>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{t("search")}</h3>
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon="🔍"
              />
            </Card>

            {/* Category Filter */}
            <Card>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{t("category")}</h3>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Price Range Filter */}
            <Card>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{t("priceRange")}</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </Card>

            {/* Sort Filter */}
            <Card>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{t("sortBy")}</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option value="trending">{t("trending")}</option>
                <option value="newest">{t("newest")}</option>
                <option value="price-low">{t("priceLowToHigh")}</option>
                <option value="price-high">{t("priceHighToLow")}</option>
              </select>
            </Card>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <Card>
                <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{t("tags")}</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </Card>
            )}

            {/* Reset Button */}
            <Button variant="secondary" className="w-full" onClick={resetFilters}>
              {t("resetFilters")}
            </Button>
          </motion.div>

          {/* Main Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Error Display */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-red-800 dark:text-red-200">{displayError}</p>
              </motion.div>
            )}

            {/* Results Header */}
            {!loading && artworks.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("showing")} {startIdx + 1}-{Math.min(startIdx + itemsPerPage, artworks.length)} {t("of")}{" "}
                {artworks.length} {t("results")}
              </p>
            )}

            {/* Gallery Grid */}
            {loading ? (
              <SkeletonLoader count={itemsPerPage} />
            ) : artworks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t("noArtworks")}
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {paginatedArtworks.map((artwork, idx) => (
                    <motion.div
                      key={artwork.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                    >
                      <ArtworkCard artwork={artwork} showDetails />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </motion.div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Browse;
