import { create } from "zustand";
import { CartItem, Artwork, User, ChatSession, Message } from "../types";
import { MOCK_CURRENT_USER } from "../data/mockData";

// Theme Store
interface ThemeStore {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: localStorage.getItem("theme") === "dark",
  toggleDarkMode: () =>
    set((state) => {
      const newDark = !state.isDark;
      localStorage.setItem("theme", newDark ? "dark" : "light");
      if (newDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { isDark: newDark };
    }),
}));

// Language Store
interface LanguageStore {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: typeof window !== "undefined" ? (localStorage.getItem("language") || "en") : "en",
  setLanguage: (lang: string) =>
    set(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("language", lang);
      }
      // You can add language-specific logic here (e.g., document.documentElement.lang = lang)
      if (typeof window !== "undefined") {
        document.documentElement.lang = lang;
      }
      return { language: lang };
    }),
}));

// Cart Store
interface CartStore {
  items: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addToCart: (artwork: Artwork) =>
    set((state) => {
      const existing = state.items.find((item) => item.artwork.id === artwork.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.artwork.id === artwork.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { artwork, quantity: 1 }] };
    }),
  removeFromCart: (artworkId: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.artwork.id !== artworkId),
    })),
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => total + item.artwork.price * item.quantity, 0);
  },
}));

// Auth Store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: MOCK_CURRENT_USER,
  isAuthenticated: true,
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: { ...MOCK_CURRENT_USER, email },
      isAuthenticated: true,
    });
  },
  register: async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: { ...MOCK_CURRENT_USER, name, email },
      isAuthenticated: true,
    });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// Chat Store
interface ChatStore {
  currentSession: ChatSession | null;
  createSession: () => void;
  addMessage: (message: Message) => void;
  botResponse: (userMessage: string) => Promise<void>;
}

const generateBotResponse = (userMessage: string): string => {
  const responses = [
    "That's a fascinating piece! I can see influences of contemporary minimalism here.",
    "This artwork resonates with themes of digital transformation.",
    "The color palette here is absolutely masterful.",
    "I'm intrigued by the artist's use of negative space.",
    "This reminds me of some groundbreaking work from emerging artists.",
    "The technical execution is remarkable.",
    "There's a beautiful balance of form and function here.",
    "This piece really captures the zeitgeist of modern art.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: null,
  createSession: () =>
    set({
      currentSession: {
        id: `session_${Date.now()}`,
        messages: [],
        createdAt: new Date().toISOString(),
      },
    }),
  addMessage: (message: Message) =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            messages: [...state.currentSession.messages, message],
          }
        : null,
    })),
  botResponse: async (userMessage: string) => {
    // Add user message
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            messages: [
              ...state.currentSession.messages,
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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add bot response
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            messages: [
              ...state.currentSession.messages,
              {
                id: `msg_${Date.now()}_bot`,
                sender: "bot",
                content: generateBotResponse(userMessage),
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : null,
    }));
  },
}));

// UI Store for modals and common states
interface UIStore {
  isArtistFollowing: Record<string, boolean>;
  toggleFollowing: (artistId: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isArtistFollowing: {},
  toggleFollowing: (artistId: string) =>
    set((state) => ({
      isArtistFollowing: {
        ...state.isArtistFollowing,
        [artistId]: !state.isArtistFollowing[artistId],
      },
    })),
}));
