import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./store";

// Pages
import Landing from "./pages/Landing";
import Browse from "./pages/Browse";
import ArtworkDetail from "./pages/ArtworkDetail";
import RoomMockup from "./pages/RoomMockup";
import ArtistProfile from "./pages/ArtistProfile";
import Chat from "./pages/Chat";
import Cart from "./pages/Cart";
import Dashboard, { AdminPanel } from "./pages/Dashboard";
import { Login, Register } from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import UserSettings from "./pages/UserSettings";

function App() {
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    // Initialize dark mode on mount
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light" || !theme) {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    // Update dark mode when it changes
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <BrowserRouter>
      <div className={isDark ? "dark" : ""}>
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
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
