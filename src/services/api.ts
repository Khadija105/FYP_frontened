import {
  Artwork,
  Artist,
  VerificationRequest,
  ListingItem,
  User,
} from "../types";
import {
  MOCK_ARTWORKS,
  MOCK_ARTISTS,
  MOCK_LISTINGS,
} from "../data/mockData";

// Simulate API calls with delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Artwork API
export const artworkAPI = {
  getAll: async (filters?: {
    category?: string;
    tags?: string[];
    priceRange?: [number, number];
    sortBy?: string;
  }): Promise<Artwork[]> => {
    await delay(300);
    let results = [...MOCK_ARTWORKS];

    if (filters?.category && filters.category !== "All") {
      results = results.filter((art) => art.category === filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter((art) =>
        filters.tags!.some((tag) => art.tags.includes(tag))
      );
    }

    if (filters?.priceRange) {
      const [min, max] = filters.priceRange;
      results = results.filter((art) => art.price >= min && art.price <= max);
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "price-low":
          results.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          results.sort((a, b) => b.price - a.price);
          break;
        case "trending":
          results.sort((a, b) => b.likes - a.likes);
          break;
        case "newest":
          results.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }

    return results;
  },

  getById: async (id: string): Promise<Artwork | null> => {
    await delay(200);
    return MOCK_ARTWORKS.find((art) => art.id === id) || null;
  },

  search: async (query: string): Promise<Artwork[]> => {
    await delay(400);
    const lowerQuery = query.toLowerCase();
    return MOCK_ARTWORKS.filter(
      (art) =>
        art.title.toLowerCase().includes(lowerQuery) ||
        art.artist.name.toLowerCase().includes(lowerQuery) ||
        art.description.toLowerCase().includes(lowerQuery) ||
        art.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },

  getFeatured: async (): Promise<Artwork[]> => {
    await delay(250);
    return MOCK_ARTWORKS.slice(0, 6);
  },

  getTrending: async (): Promise<Artwork[]> => {
    await delay(250);
    return [...MOCK_ARTWORKS].sort((a, b) => b.likes - a.likes).slice(0, 8);
  },
};

// Artist API
export const artistAPI = {
  getAll: async (): Promise<Artist[]> => {
    await delay(200);
    return MOCK_ARTISTS;
  },

  getById: async (id: string): Promise<Artist | null> => {
    await delay(150);
    return MOCK_ARTISTS.find((artist) => artist.id === id) || null;
  },

  getArtworks: async (artistId: string): Promise<Artwork[]> => {
    await delay(250);
    return MOCK_ARTWORKS.filter((art) => art.artist.id === artistId);
  },

  getTrending: async (): Promise<Artist[]> => {
    await delay(200);
    return [...MOCK_ARTISTS].sort((a, b) => b.followers - a.followers);
  },

  follow: async (artistId: string): Promise<void> => {
    await delay(400);
    // Mock follow action
  },

  unfollow: async (artistId: string): Promise<void> => {
    await delay(400);
    // Mock unfollow action
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<User[]> => {
    await delay(300);
    return [
      {
        id: "user1",
        email: "alex@example.com",
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        role: "user",
        createdAt: "2023-06-15",
      },
      {
        id: "user2",
        email: "sophia@example.com",
        name: "Sophia Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        role: "artist",
        createdAt: "2023-05-10",
      },
    ];
  },

  getArtworks: async (): Promise<Artwork[]> => {
    await delay(300);
    return MOCK_ARTWORKS;
  },

  getVerificationRequests: async (): Promise<VerificationRequest[]> => {
    await delay(300);
    return [
      {
        id: "vr1",
        artistId: "artist1",
        artistName: "Sofia Chen",
        status: "pending",
        submittedAt: "2024-03-15",
      },
      {
        id: "vr2",
        artistId: "artist2",
        artistName: "Marcus Johnson",
        status: "approved",
        submittedAt: "2024-02-20",
      },
      {
        id: "vr3",
        artistId: "artist3",
        artistName: "Luna Rivera",
        status: "rejected",
        submittedAt: "2024-01-10",
      },
    ];
  },

  approveVerification: async (requestId: string): Promise<void> => {
    await delay(400);
    // Mock approval
  },

  rejectVerification: async (requestId: string): Promise<void> => {
    await delay(400);
    // Mock rejection
  },

  deleteArtwork: async (artworkId: string): Promise<void> => {
    await delay(400);
    // Mock deletion
  },

  deleteUser: async (userId: string): Promise<void> => {
    await delay(400);
    // Mock deletion
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    await delay(300);
    return {
      totalSales: 85420,
      totalArtworks: 24,
      followers: 15420,
      revenue: 32000,
    };
  },

  getListings: async (): Promise<ListingItem[]> => {
    await delay(250);
    return MOCK_LISTINGS;
  },

  getRevenueData: async () => {
    await delay(300);
    return [
      { month: "Jan", revenue: 12000 },
      { month: "Feb", revenue: 19000 },
      { month: "Mar", revenue: 15000 },
      { month: "Apr", revenue: 28000 },
      { month: "May", revenue: 24000 },
      { month: "Jun", revenue: 32000 },
    ];
  },

  updateListing: async (id: string, updates: Partial<ListingItem>): Promise<void> => {
    await delay(400);
    // Mock update
  },

  removeListing: async (id: string): Promise<void> => {
    await delay(400);
    // Mock removal
  },
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: async (message: string) => {
    await delay(1500);
    const responses = [
      "That's an interesting perspective! Let me find similar artworks for you.",
      "I love the energy of this piece. Would you like to explore more abstract works?",
      "This style resonates with many collectors. Shall I show you related pieces?",
      "Great taste! This artist is trending right now.",
      "I'm analyzing this - it has elements of both contemporary and classical influence.",
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      suggestedArtworks: MOCK_ARTWORKS.slice(0, 3),
    };
  },

  suggestArtworks: async (preferences: string[]): Promise<Artwork[]> => {
    await delay(800);
    return MOCK_ARTWORKS.slice(
      Math.floor(Math.random() * MOCK_ARTWORKS.length),
      Math.floor(Math.random() * MOCK_ARTWORKS.length) + 3
    );
  },
};

// Cart API
export const cartAPI = {
  checkout: async (items: any[]): Promise<{ orderId: string }> => {
    await delay(2000);
    return { orderId: `ORD_${Date.now()}` };
  },

  validateCoupon: async (code: string): Promise<number> => {
    await delay(500);
    if (code === "WELCOME10") return 0.1; // 10% discount
    if (code === "SAVE20") return 0.2; // 20% discount
    throw new Error("Invalid coupon code");
  },
};
