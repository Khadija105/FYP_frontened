import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Pages
import Landing from "./pages/Landing";
import Browse from "./pages/Browse";
import ArtworkDetail from "./pages/ArtworkDetail";
import RoomMockup from "./pages/RoomMockup";
import ArtistProfile from "./pages/ArtistProfile";
import Chat from "./pages/Chat";
import Cart from "./pages/Cart";
import AddArtwork from "./pages/AddArtwork";
import Dashboard, { AdminPanel } from "./pages/Dashboard";
import { Login, Register } from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import UserSettings from "./pages/UserSettings";

/**
 * Protected route that requires authentication
 */
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, bootstrapping } = useAuthStore();

  if (bootstrapping) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const bootstrapping = useAuthStore((s) => s.bootstrapping);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (bootstrapping) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/artist/:id" element={<ArtistProfile />} />
          <Route path="/room-mockup" element={<RoomMockup />} />
          <Route path="/chat" element={<Chat />} />

          {/* Protected Routes */}
          <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<UserProfile />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<UserSettings />} />} />
          <Route path="/add-artwork" element={<ProtectedRoute element={<AddArtwork />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} />} />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
