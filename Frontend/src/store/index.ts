import { create } from "zustand";
import { CartItem, Artwork, User, ChatSession, Message } from "../types";
import { authAPI, chatbotAPI, getToken, setToken } from "../services/api";

type Theme = "light" | "dark" | "auto";

const applyThemeToDocument = (effectiveDark: boolean) => {
  if (typeof document === "undefined") return;
  if (effectiveDark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
};

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem("theme");
  if (v === "dark" || v === "light" || v === "auto") return v;
  return "light";
};

const isSystemDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

interface ThemeStore {
  theme: Theme;
  isDark: boolean;
  setTheme: (t: Theme) => void;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  const initial: Theme = readStoredTheme();
  const initialDark = initial === "dark" || (initial === "auto" && isSystemDark());
  applyThemeToDocument(initialDark);

  return {
    theme: initial,
    isDark: initialDark,
    setTheme: (t: Theme) =>
      set(() => {
        if (typeof window !== "undefined") localStorage.setItem("theme", t);
        const dark = t === "dark" || (t === "auto" && isSystemDark());
        applyThemeToDocument(dark);
        return { theme: t, isDark: dark };
      }),
    toggleDarkMode: () => {
      const next: Theme = get().isDark ? "light" : "dark";
      get().setTheme(next);
    },
  };
});

interface LanguageStore {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language:
    typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en",
  setLanguage: (lang) =>
    set(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("language", lang);
        document.documentElement.lang = lang;
      }
      return { language: lang };
    }),
}));

interface CartStore {
  items: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addToCart: (artwork) =>
    set((state) => {
      const existing = state.items.find((i) => i.artwork.id === artwork.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.artwork.id === artwork.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { artwork, quantity: 1 }] };
    }),
  removeFromCart: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.artwork.id !== id) })),
  clearCart: () => set({ items: [] }),
  getTotal: () =>
    get().items.reduce((t, i) => t + i.artwork.price * i.quantity, 0),
}));

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  bootstrapping: boolean;
  bootstrapError: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  bootstrapping: true,
  bootstrapError: null,

  bootstrap: async () => {
    const token = getToken();
    if (!token) {
      set({ bootstrapping: false, bootstrapError: null });
      return;
    }
    try {
      const user = await authAPI.me();
      set({ user, isAuthenticated: true, bootstrapError: null });
    } catch (error) {
      setToken(null);
      set({ user: null, isAuthenticated: false, bootstrapError: "Session expired. Please log in again." });
    } finally {
      set({ bootstrapping: false });
    }
  },

  login: async (email, password) => {
    try {
      const { user, token } = await authAPI.login(email, password);
      setToken(token);
      set({ user, isAuthenticated: true, bootstrapError: null });
    } catch (error) {
      set({ bootstrapError: "Invalid email or password" });
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      const { user, token } = await authAPI.register(name, email, password);
      setToken(token);
      set({ user, isAuthenticated: true, bootstrapError: null });
    } catch (error) {
      set({ bootstrapError: "Registration failed" });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      /* ignore - server may already be unreachable or token expired */
    }
    setToken(null);
    set({ user: null, isAuthenticated: false, bootstrapError: null });
  },

  refreshUser: async () => {
    if (!getToken()) return;
    try {
      const user = await authAPI.me();
      set({ user, isAuthenticated: true });
    } catch {
      /* ignore */
    }
  },
}));

interface ChatStore {
  currentSession: ChatSession | null;
  sessionId: string | null;
  createSession: () => void;
  addMessage: (m: Message) => void;
  botResponse: (
    userMessage: string
  ) => Promise<{ response: string; suggestedArtworks: Artwork[] } | null>;
  resetSession: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: null,
  sessionId: null,
  createSession: () =>
    set({
      currentSession: {
        id: `session_${Date.now()}`,
        messages: [],
        createdAt: new Date().toISOString(),
      },
      sessionId: null,
    }),
  addMessage: (message) =>
    set((s) => ({
      currentSession: s.currentSession
        ? {
            ...s.currentSession,
            messages: [...s.currentSession.messages, message],
          }
        : null,
    })),
  botResponse: async (userMessage) => {
    set((s) => ({
      currentSession: s.currentSession
        ? {
            ...s.currentSession,
            messages: [
              ...s.currentSession.messages,
              {
                id: `msg_${Date.now()}`,
                sender: "user",
                content: userMessage,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : null,
    }));

    try {
      const result = await chatbotAPI.sendMessage(userMessage, get().sessionId);
      set({ sessionId: result.sessionId });
      set((s) => ({
        currentSession: s.currentSession
          ? {
              ...s.currentSession,
              messages: [
                ...s.currentSession.messages,
                {
                  id: `msg_${Date.now()}_bot`,
                  sender: "bot",
                  content: result.response,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : null,
      }));
      return { response: result.response, suggestedArtworks: result.suggestedArtworks };
    } catch (err) {
      set((s) => ({
        currentSession: s.currentSession
          ? {
              ...s.currentSession,
              messages: [
                ...s.currentSession.messages,
                {
                  id: `msg_${Date.now()}_err`,
                  sender: "bot",
                  content:
                    "Sorry, the assistant is temporarily unavailable. Please try again.",
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : null,
      }));
      return null;
    }
  },
  resetSession: () => set({ currentSession: null, sessionId: null }),
}));

interface UIStore {
  isArtistFollowing: Record<string, boolean>;
  setFollowing: (artistId: string, following: boolean) => void;
  toggleFollowing: (artistId: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  isArtistFollowing: {},
  setFollowing: (artistId, following) =>
    set((s) => ({
      isArtistFollowing: { ...s.isArtistFollowing, [artistId]: following },
    })),
  toggleFollowing: (artistId) => {
    const current = !!get().isArtistFollowing[artistId];
    get().setFollowing(artistId, !current);
  },
}));
