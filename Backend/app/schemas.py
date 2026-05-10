from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field


class Artist(BaseModel):
    id: str
    name: str
    avatar: str
    bio: str
    followers: int
    isVerified: bool
    followingStatus: Optional[bool] = None


class ArtistUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None


class ArtworkStory(BaseModel):
    statement: str
    process: str
    inspiration: str


class Comment(BaseModel):
    id: str
    artworkId: str
    userId: str
    username: str
    avatar: str
    text: str
    timestamp: str
    likes: int = 0


class CommentCreate(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class Artwork(BaseModel):
    id: str
    title: str
    artist: Artist
    image: str
    price: float
    category: str
    tags: List[str]
    description: str
    story: Optional[ArtworkStory] = None
    youtubeUrl: Optional[str] = None
    createdAt: str
    likes: int
    userLiked: Optional[bool] = False
    comments: Optional[List[Comment]] = None


class ArtworkCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    image: str
    price: float = Field(ge=0)
    category: str
    tags: List[str] = Field(default_factory=list)
    description: str = ""
    artistId: Optional[str] = None
    story: Optional[ArtworkStory] = None
    youtubeUrl: Optional[str] = None


class ArtworkUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None
    story: Optional[ArtworkStory] = None
    youtubeUrl: Optional[str] = None


class LikeResponse(BaseModel):
    liked: bool
    likes: int


# Users
class User(BaseModel):
    id: str
    email: str
    name: str
    avatar: str
    role: Literal["user", "artist", "admin"]
    createdAt: str


class UserProfile(User):
    bio: str = ""
    location: str = ""
    website: str = ""
    followers: int = 0
    following: int = 0
    favorites: int = 0


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None


class Settings(BaseModel):
    emailNotifications: bool = True
    pushNotifications: bool = True
    marketingEmails: bool = False
    privateProfile: bool = False
    twoFactorAuth: bool = False
    theme: Literal["light", "dark", "auto"] = "light"
    language: str = "en"


class Notification(BaseModel):
    id: str
    title: str
    body: str
    createdAt: str
    read: bool = False


# Auth
class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str
    password: str = Field(min_length=6, max_length=128)


class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=6, max_length=128)


class AuthResponse(BaseModel):
    user: User
    token: str


# Verification
class VerificationRequest(BaseModel):
    id: str
    artistId: str
    artistName: str
    status: Literal["pending", "approved", "rejected"]
    submittedAt: str
    documentUrl: Optional[str] = None
    notes: Optional[str] = ""


class VerificationSubmit(BaseModel):
    notes: Optional[str] = ""
    documentUrl: Optional[str] = None


# Listings (dashboard)
class ListingItem(BaseModel):
    id: str
    title: str
    price: float
    status: Literal["active", "sold", "delisted"]
    views: int
    sales: int


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    status: Optional[Literal["active", "sold", "delisted"]] = None
    views: Optional[int] = None
    sales: Optional[int] = None


class RevenueData(BaseModel):
    month: str
    revenue: float


class DashboardStats(BaseModel):
    totalSales: float
    totalArtworks: int
    followers: int
    revenue: float


# Cart / orders
class CartItemIn(BaseModel):
    artworkId: Optional[str] = None
    quantity: int = 1
    artwork: Optional[dict] = None


class CartCheckoutRequest(BaseModel):
    items: List[dict]
    couponCode: Optional[str] = None


class Order(BaseModel):
    id: str
    userId: str
    items: List[dict]
    subtotal: float
    discount: float
    tax: float
    total: float
    status: Literal["paid", "shipped", "delivered", "cancelled"] = "paid"
    couponCode: Optional[str] = None
    createdAt: str


class CouponRequest(BaseModel):
    code: str


class CouponResponse(BaseModel):
    discount: float


# Chat
class ChatMessage(BaseModel):
    id: str
    sender: Literal["user", "bot"]
    content: str
    timestamp: str


class ChatSession(BaseModel):
    id: str
    userId: Optional[str] = None
    messages: List[ChatMessage]
    createdAt: str


class ChatMessageRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None


class ChatMessageResponse(BaseModel):
    sessionId: str
    response: str
    suggestedArtworks: List[Artwork]


class ChatSuggestRequest(BaseModel):
    preferences: List[str] = Field(default_factory=list)


# Room mockup layouts
class RoomLayout(BaseModel):
    id: str
    userId: Optional[str]
    artworkId: str
    roomImage: str
    size: int
    x: float
    y: float
    name: Optional[str] = ""
    createdAt: str


class RoomLayoutCreate(BaseModel):
    artworkId: str
    roomImage: str
    size: int = Field(ge=10, le=1000)
    x: float = Field(ge=0, le=100)
    y: float = Field(ge=0, le=100)
    name: Optional[str] = ""


# Generic
class MessageResponse(BaseModel):
    message: str


class UploadResponse(BaseModel):
    url: str
    filename: str
    size: int
