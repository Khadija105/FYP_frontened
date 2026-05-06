import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Card, Input, Pagination, SkeletonLoader } from "../components/ui";
import { ArtworkCard } from "../components/common/Cards";
import { useTranslation } from "../hooks";
import { artworkAPI } from "../services/api";
import { CATEGORIES, MOCK_ARTWORKS } from "../data/mockData";
import { Artwork } from "../types";

const Browse = () => {
  const { t } = useTranslation();
  const [filtered, setFiltered] = useState<Artwork[]>(MOCK_ARTWORKS);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedArtworks = filtered.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedTags, priceRange, sortBy, searchQuery]);

  const applyFilters = async () => {
    setLoading(true);
    setCurrentPage(1);

    try {
      let results = await artworkAPI.getAll({
        category: selectedCategory,
        tags: selectedTags,
        priceRange,
        sortBy,
      });

      if (searchQuery) {
        results = await artworkAPI.search(searchQuery);
      }

      setFiltered(results);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const allTags = Array.from(
    new Set(MOCK_ARTWORKS.flatMap((art) => art.tags))
  ).sort();

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
            <Card>
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{t("tags")}</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 8).map((tag) => (
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

            {/* Reset Button */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedTags([]);
                setPriceRange([0, 10000]);
                setSortBy("trending");
                setSearchQuery("");
              }}
            >
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
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {t("showing")} {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filtered.length)} {t("of")}{" "}
                {filtered.length} {t("results")}
              </p>
            </div>

            {/* Gallery Grid */}
            {loading ? (
              <SkeletonLoader count={itemsPerPage} />
            ) : filtered.length === 0 ? (
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
                      transition={{ delay: idx * 0.1 }}
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
