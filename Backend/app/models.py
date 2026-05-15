from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId: {v}")
        return ObjectId(v)

    def __repr__(self):
        return f"ObjectId('{self}')"


class Artist(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    name: str
    avatar: str
    bio: str
    followers: int = 0
    isVerified: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class Story(BaseModel):
    statement: Optional[str] = None
    process: Optional[str] = None
    inspiration: Optional[str] = None


class Artwork(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    title: str
    artistId: str
    image: str
    price: float
    category: str
    tags: List[str] = []
    description: str
    story: Optional[Story] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0
    userLiked: bool = False
    comments: List[dict] = []

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class User(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    email: str
    name: str
    avatar: Optional[str] = None
    role: str = "user"
    following: List[str] = []
    likedArtworks: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class VerificationRequest(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    artistId: str
    artistName: str
    status: str = "pending"
    submittedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
