import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  Artwork,
  Artist,
  VerificationRequest,
  ListingItem,
  User,
  Comment,
} from "../types";

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "artellect.token";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      // Token invalid or expired — clear it so the auth store can react.
      setToken(null);
    }
    return Promise.reject(error);
  }
);

const unwrap = <T>(p: Promise<{ data: T }>): Promise<T> => p.then((r) => r.data);

// ===== Auth ===============================================================
export interface AuthResponse {
  user: User;
  token: string;
}

export const authAPI = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    unwrap(http.post("/api/auth/login", { email, password })),

  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    unwrap(http.post("/api/auth/register", { name, email, password })),

  me: (): Promise<User> => unwrap(http.get("/api/auth/me")),

  logout: (): Promise<{ message: string }> =>
    unwrap(http.post("/api/auth/logout")),

  changePassword: (currentPassword: string, newPassword: string) =>
    unwrap(http.post("/api/auth/change-password", { currentPassword, newPassword })),

  deleteAccount: () => unwrap(http.delete("/api/auth/me")),
};

// ===== Artworks ===========================================================
export const artworkAPI = {
  getAll: (filters?: {
    category?: string;
    tags?: string[];
    priceRange?: [number, number];
    sortBy?: string;
  }): Promise<Artwork[]> => {
    const params: Record<string, string | number> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.tags?.length) params.tags = filters.tags.join(",");
    if (filters?.priceRange) {
      params.min_price = filters.priceRange[0];
      params.max_price = filters.priceRange[1];
    }
    if (filters?.sortBy) params.sort_by = filters.sortBy;
    return unwrap(http.get<Artwork[]>("/api/artworks", { params }));
  },

  getById: (id: string): Promise<Artwork | null> =>
    http
      .get<Artwork>(`/api/artworks/${id}`)
      .then((r) => r.data)
      .catch((err) => (err?.response?.status === 404 ? null : Promise.reject(err))),

  search: (query: string): Promise<Artwork[]> =>
    unwrap(http.get("/api/artworks/search", { params: { q: query } })),

  getFeatured: (): Promise<Artwork[]> => unwrap(http.get("/api/artworks/featured")),
  getTrending: (): Promise<Artwork[]> => unwrap(http.get("/api/artworks/trending")),

  create: (payload: Partial<Artwork> & { image: string }): Promise<Artwork> =>
    unwrap(http.post("/api/artworks", payload)),

  update: (id: string, payload: Partial<Artwork>): Promise<Artwork> =>
    unwrap(http.patch(`/api/artworks/${id}`, payload)),

  remove: (id: string) => unwrap(http.delete(`/api/artworks/${id}`)),

  toggleLike: (id: string): Promise<{ liked: boolean; likes: number }> =>
    unwrap(http.post(`/api/artworks/${id}/like`)),

  getComments: (id: string): Promise<Comment[]> =>
    unwrap(http.get(`/api/artworks/${id}/comments`)),

  addComment: (id: string, text: string): Promise<Comment> =>
    unwrap(http.post(`/api/artworks/${id}/comments`, { text })),

  deleteComment: (id: string, commentId: string) =>
    unwrap(http.delete(`/api/artworks/${id}/comments/${commentId}`)),
};

// ===== Artists ============================================================
export const artistAPI = {
  getAll: (): Promise<Artist[]> => unwrap(http.get("/api/artists")),

  getById: (id: string): Promise<Artist | null> =>
    http
      .get<Artist>(`/api/artists/${id}`)
      .then((r) => r.data)
      .catch((err) => (err?.response?.status === 404 ? null : Promise.reject(err))),

  getArtworks: (id: string): Promise<Artwork[]> =>
    unwrap(http.get(`/api/artists/${id}/artworks`)),

  getTrending: (): Promise<Artist[]> => unwrap(http.get("/api/artists/trending")),

  follow: (id: string): Promise<Artist> => unwrap(http.post(`/api/artists/${id}/follow`)),

  unfollow: (id: string): Promise<Artist> => unwrap(http.post(`/api/artists/${id}/unfollow`)),
};

// ===== Users (current user) ==============================================
export interface UserProfile extends User {
  bio: string;
  location: string;
  website: string;
  followers: number;
  following: number;
  favorites: number;
}

export interface UserSettingsPayload {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  privateProfile: boolean;
  twoFactorAuth: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
}

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export const userAPI = {
  getProfile: (): Promise<UserProfile> => unwrap(http.get("/api/users/me/profile")),
  updateProfile: (patch: Partial<UserProfile>): Promise<UserProfile> =>
    unwrap(http.patch("/api/users/me/profile", patch)),

  getSettings: (): Promise<UserSettingsPayload> => unwrap(http.get("/api/users/me/settings")),
  updateSettings: (payload: UserSettingsPayload): Promise<UserSettingsPayload> =>
    unwrap(http.put("/api/users/me/settings", payload)),

  getNotifications: (): Promise<UserNotification[]> =>
    unwrap(http.get("/api/users/me/notifications")),
  markNotificationRead: (id: string) =>
    unwrap(http.post(`/api/users/me/notifications/${id}/read`)),
  clearNotifications: () => unwrap(http.delete("/api/users/me/notifications")),

  getFavorites: (): Promise<Artwork[]> => unwrap(http.get("/api/users/me/favorites")),
  getActivity: () => unwrap(http.get("/api/users/me/activity")),

  becomeArtist: (): Promise<UserProfile> => unwrap(http.post("/api/users/me/become-artist")),
};

// ===== Cart / Orders ======================================================
export interface OrderRecord {
  id: string;
  userId: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  couponCode?: string | null;
  createdAt: string;
}

export const cartAPI = {
  validateCoupon: async (code: string): Promise<number> => {
    const { data } = await http.post<{ discount: number }>(
      "/api/cart/validate-coupon",
      { code }
    );
    return data.discount;
  },

  checkout: (items: any[], couponCode?: string | null): Promise<OrderRecord> =>
    unwrap(http.post("/api/cart/checkout", { items, couponCode })),
};

export const orderAPI = {
  list: (): Promise<OrderRecord[]> => unwrap(http.get("/api/orders")),
  get: (id: string): Promise<OrderRecord> => unwrap(http.get(`/api/orders/${id}`)),
};

// ===== Dashboard ==========================================================
export const dashboardAPI = {
  getStats: () => unwrap(http.get("/api/dashboard/stats")),
  getListings: (): Promise<ListingItem[]> => unwrap(http.get("/api/dashboard/listings")),
  getRevenueData: () => unwrap(http.get("/api/dashboard/revenue")),
  updateListing: (id: string, updates: Partial<ListingItem>) =>
    unwrap(http.patch(`/api/dashboard/listings/${id}`, updates)),
  removeListing: (id: string) => unwrap(http.delete(`/api/dashboard/listings/${id}`)),
  withdraw: () => unwrap(http.post("/api/dashboard/withdraw")),
};

// ===== Admin ==============================================================
export const adminAPI = {
  getUsers: (): Promise<User[]> => unwrap(http.get("/api/admin/users")),
  getArtworks: (): Promise<Artwork[]> => unwrap(http.get("/api/admin/artworks")),
  getVerificationRequests: (): Promise<VerificationRequest[]> =>
    unwrap(http.get("/api/admin/verification-requests")),
  approveVerification: (id: string) =>
    unwrap(http.post(`/api/admin/verification-requests/${id}/approve`)),
  rejectVerification: (id: string) =>
    unwrap(http.post(`/api/admin/verification-requests/${id}/reject`)),
  deleteArtwork: (id: string) => unwrap(http.delete(`/api/admin/artworks/${id}`)),
  deleteUser: (id: string) => unwrap(http.delete(`/api/admin/users/${id}`)),
};

// ===== Chat ===============================================================
export interface ChatSendResult {
  sessionId: string;
  response: string;
  suggestedArtworks: Artwork[];
}

export const chatbotAPI = {
  sendMessage: (message: string, sessionId?: string | null): Promise<ChatSendResult> =>
    unwrap(http.post("/api/chatbot/message", { message, sessionId })),

  suggestArtworks: (preferences: string[]): Promise<Artwork[]> =>
    unwrap(http.post("/api/chatbot/suggest", { preferences })),
};

export const chatSessionAPI = {
  list: () => unwrap(http.get("/api/chat/sessions")),
  create: () => unwrap(http.post("/api/chat/sessions")),
  get: (id: string) => unwrap(http.get(`/api/chat/sessions/${id}`)),
  remove: (id: string) => unwrap(http.delete(`/api/chat/sessions/${id}`)),
};

// ===== Room layouts =======================================================
export interface RoomLayoutRecord {
  id: string;
  artworkId: string;
  roomImage: string;
  size: number;
  x: number;
  y: number;
  name?: string;
  createdAt: string;
}

export const roomLayoutAPI = {
  list: (): Promise<RoomLayoutRecord[]> => unwrap(http.get("/api/room-layouts")),
  create: (payload: Omit<RoomLayoutRecord, "id" | "createdAt">) =>
    unwrap(http.post<RoomLayoutRecord>("/api/room-layouts", payload)),
  remove: (id: string) => unwrap(http.delete(`/api/room-layouts/${id}`)),
};

// ===== Verifications ======================================================
export const verificationAPI = {
  submit: (notes?: string, documentUrl?: string) =>
    unwrap(http.post("/api/verifications", { notes, documentUrl })),
  getMine: (): Promise<VerificationRequest | null> =>
    unwrap(http.get("/api/verifications/me")),
};

// ===== Uploads ============================================================
export const uploadAPI = {
  image: async (file: File): Promise<{ url: string; filename: string; size: number }> => {
    const form = new FormData();
    form.append("file", file);
    const config: AxiosRequestConfig = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    const { data } = await http.post("/api/uploads/image", form, config);
    return data;
  },
};

// ===== Configuration ======================================================
export const configAPI = {
  getCategories: (): Promise<string[]> => unwrap(http.get("/api/config/categories")),
};
