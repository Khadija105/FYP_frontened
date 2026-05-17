import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Card, Button, Badge } from "../components/ui";
import { dashboardAPI, adminAPI } from "../services/api";
import { ListingItem, VerificationRequest, User, Artwork } from "../types";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, listingsData, revenueChartData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getListings(),
        dashboardAPI.getRevenueData(),
      ]);
      setStats(statsData);
      setListings(listingsData);
      setRevenueData(revenueChartData as any[]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadArtwork = () => {
    navigate("/add-artwork");
  };

  const handleViewAnalytics = () => {
    setActiveTab("analytics");
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await dashboardAPI.withdraw();
      alert("Withdrawal request submitted successfully!");
      await loadData();
    } catch (error) {
      alert("Failed to process withdrawal. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading || !stats) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <p>Loading dashboard...</p>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Artist Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your artworks and track performance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: "Total Sales",
              value: `$${stats.totalSales.toLocaleString()}`,
              icon: "💰",
              color: "indigo",
            },
            {
              label: "Artworks",
              value: stats.totalArtworks.toString(),
              icon: "🎨",
              color: "purple",
            },
            {
              label: "Followers",
              value: `${(stats.followers / 1000).toFixed(1)}K`,
              icon: "👥",
              color: "pink",
            },
            {
              label: "This Month",
              value: `$${stats.revenue.toLocaleString()}`,
              icon: "📈",
              color: "green",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.value}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "listings", label: "Listings" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Chart */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Revenue Trend
                </h3>
                <div className="space-y-3">
                  {revenueData.map((data, i) => {
                    const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
                    const percentage = (data.revenue / maxRevenue) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{data.month}</span>
                          <span className="font-semibold">
                            ${data.revenue.toLocaleString()}
                          </span>
                        </div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button size="lg" className="w-full" onClick={handleUploadArtwork}>
                    Upload New Artwork
                  </Button>
                  <Button size="lg" variant="secondary" className="w-full" onClick={handleViewAnalytics}>
                    View Analytics
                  </Button>
                  <Button size="lg" variant="ghost" className="w-full" onClick={handleWithdraw} disabled={withdrawing}>
                    {withdrawing ? "Processing..." : "Withdraw Earnings"}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "listings" && (
            <Card className="p-6 overflow-x-auto">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                Your Listings
              </h3>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">
                      Title
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">
                      Price
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">
                      Views
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600 dark:text-gray-400">
                      Sales
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing, i) => (
                    <motion.tr
                      key={listing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-2 text-gray-900 dark:text-white">
                        {listing.title}
                      </td>
                      <td className="py-3 px-2 font-semibold text-indigo-600 dark:text-indigo-400">
                        ${listing.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            listing.status === "active"
                              ? "success"
                              : listing.status === "sold"
                              ? "secondary"
                              : "danger"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-700 dark:text-gray-300">
                        {listing.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-gray-700 dark:text-gray-300">
                        {listing.sales}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Top Performing
                </h3>
                <div className="space-y-3">
                  {listings
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((listing, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {i + 1}. {listing.title}
                        </span>
                        <Badge variant="primary">{listing.views} views</Badge>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Traffic Sources
                </h3>
                <div className="space-y-3">
                  {[
                    { source: "Direct", percentage: 40 },
                    { source: "Search", percentage: 35 },
                    { source: "Social", percentage: 15 },
                    { source: "Other", percentage: 10 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.source}</span>
                        <span className="font-semibold">{item.percentage}%</span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: i * 0.1 }}
                        className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </PageContainer>
    </MainLayout>
  );
};

// Admin Panel Page
export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<
    VerificationRequest[]
  >([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, artworksData, verificationsData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getArtworks(),
        adminAPI.getVerificationRequests(),
      ]);
      setUsers(usersData);
      setArtworks(artworksData);
      setVerificationRequests(verificationsData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageContainer className="pt-20 text-center">
          <p>Loading admin panel...</p>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage platform content and users
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: "users", label: "Users", count: users.length },
            { id: "artworks", label: "Artworks", count: artworks.length },
            {
              id: "verifications",
              label: "Verification Requests",
              count: verificationRequests.length,
            },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              {tab.label} <Badge className="ml-2">{tab.count}</Badge>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "users" && (
            <Card className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold">User</th>
                    <th className="text-left py-3 px-2 font-semibold">Email</th>
                    <th className="text-left py-3 px-2 font-semibold">Role</th>
                    <th className="text-left py-3 px-2 font-semibold">
                      Joined
                    </th>
                    <th className="text-left py-3 px-2 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-2 flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        {user.name}
                      </td>
                      <td className="py-3 px-2">{user.email}</td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "danger"
                              : user.role === "artist"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => adminAPI.deleteUser(user.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {activeTab === "artworks" && (
            <Card className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold">Title</th>
                    <th className="text-left py-3 px-2 font-semibold">Artist</th>
                    <th className="text-left py-3 px-2 font-semibold">
                      Category
                    </th>
                    <th className="text-left py-3 px-2 font-semibold">Price</th>
                    <th className="text-left py-3 px-2 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.slice(0, 10).map((artwork, i) => (
                    <motion.tr
                      key={artwork.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-2">{artwork.title}</td>
                      <td className="py-3 px-2">{artwork.artist.name}</td>
                      <td className="py-3 px-2">{artwork.category}</td>
                      <td className="py-3 px-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                        ${artwork.price}
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => adminAPI.deleteArtwork(artwork.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {activeTab === "verifications" && (
            <div className="space-y-4">
              {verificationRequests.map((request, i) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {request.artistName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "warning"
                              : request.status === "approved"
                              ? "success"
                              : "danger"
                          }
                        >
                          {request.status}
                        </Badge>
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                adminAPI.approveVerification(request.id)
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() =>
                                adminAPI.rejectVerification(request.id)
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;
