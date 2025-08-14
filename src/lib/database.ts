// Database connection and models
import { MongoClient, type Db, type Collection } from "mongodb"

let client: MongoClient
let db: Db

export interface User {
  _id?: string
  username: string
  email: string
  password: string
  name?: string
  bio?: string
  profilePicture?: string
  interests: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  _id?: string
  content: string
  imageUrl?: string
  authorId: string
  author?: User
  likes: string[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: string
  content: string
  authorId: string
  author?: User
  postId: string
  parentId?: string // For nested replies
  replies?: Comment[]
  createdAt: Date
}

export interface Like {
  _id?: string
  userId: string
  postId: string
  createdAt: Date
}

export interface Follow {
  _id?: string
  followerId: string
  followingId: string
  createdAt: Date
}

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/connecthub"
    client = new MongoClient(uri)
    await client.connect()
    db = client.db("connecthub")

    console.log("Connected to MongoDB")
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function getCollection<T>(name: string): Promise<Collection<T>> {
  const database = await connectToDatabase()
  return database.collection<T>(name)
}

// Helper functions for database operations
export const collections = {
  users: () => getCollection<User>("users"),
  posts: () => getCollection<Post>("posts"),
  comments: () => getCollection<Comment>("comments"),
  likes: () => getCollection<Like>("likes"),
  follows: () => getCollection<Follow>("follows"),
}
