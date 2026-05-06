// Type definitions for the entire application

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface Artwork {
  id: string;
  title: string;
  artist: Artist;
  image: string;
  price: number;
  category: string;
  tags: string[];
  description: string;
  story?: {
    statement: string;
    process: string;
    inspiration: string;
  };
  youtubeUrl?: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  comments?: Comment[];
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  isVerified: boolean;
  followingStatus?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: "user" | "artist" | "admin";
  createdAt: string;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

export interface VerificationRequest {
  id: string;
  artistId: string;
  artistName: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface ListingItem {
  id: string;
  title: string;
  price: number;
  status: "active" | "sold" | "delisted";
  views: number;
  sales: number;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
  artwork?: Artwork;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: string;
}
