import type { ObjectId } from "mongodb"

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  STATUS_POSTS: "status_posts",
  CONTRIBUTIONS: "contributions",
  SETTINGS: "settings",
  NEWS: "news",
  EVENTS: "events",
}

// User model
export interface User {
  _id?: ObjectId
  name: string
  email: string
  passwordHash?: string
  role: "admin" | "contributor" | "user"
  isApproved: boolean
  joinedAt: Date
  contributionsCount: number
  badge?: string
  avatarUrl?: string | null
}

// Status post model
export interface StatusPost {
  _id?: ObjectId
  day: string // YYYY-MM-DD format
  content: string
  source?: string
  createdAt: Date
  updatedAt?: Date
  createdBy?: ObjectId | string
  approved: boolean
}

// Contribution model
export interface Contribution {
  _id?: ObjectId
  content: string
  source?: string
  userId: ObjectId | string
  status: "pending" | "approved" | "rejected" | "featured" | "disqualified"
  createdAt: Date
  updatedAt?: Date
  reviewedBy?: ObjectId | string
  reviewedAt?: Date
  reviewNotes?: string
  rejectionReason?: string
}

// Settings model
export interface Settings {
  _id?: ObjectId
  key: string
  value: any
  updatedAt: Date
}

// News model
export interface News {
  _id?: ObjectId
  title: string
  content: string
  summary: string
  imageUrl?: string
  author: string
  authorId: ObjectId | string
  tags?: string[]
  published: boolean
  publishedAt: Date
  createdAt: Date
  updatedAt?: Date
  featured: boolean
}

// Event model
export interface Event {
  _id?: ObjectId
  title: string
  description: string
  location: string
  startDate: Date
  endDate?: Date
  imageUrl?: string
  organizer: string
  organizerId: ObjectId | string
  registrationUrl?: string
  registrationRequired: boolean
  maxAttendees?: number
  tags?: string[]
  published: boolean
  createdAt: Date
  updatedAt?: Date
  featured: boolean
}
