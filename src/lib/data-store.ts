// Simple in-memory data store for development
export interface User {
  id: string
  username: string
  email: string
  password: string
  interests: string[]
  createdAt: Date
}

export interface Post {
  authorId: string
  imageUrl: any
  id: string
  userId: string
  content: string
  image?: string
  createdAt: Date
  likes: string[]
  comments: Comment[]
}

export interface Comment {
  id: string
  userId: string
  username: string
  content: string
  createdAt: Date
}

export interface ChatMessage {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  createdAt: Date
}

declare global {
  var __users: User[] | undefined
  var __posts: Post[] | undefined
  var __chatMessages: ChatMessage[] | undefined
  var __follows: { followerId: string; followingId: string }[] | undefined
}

// Initialize global storage if not exists
if (!global.__users) {
  global.__users = []
}
if (!global.__posts) {
  global.__posts = []
}
if (!global.__chatMessages) {
  global.__chatMessages = []
}
if (!global.__follows) {
  global.__follows = []
}

// Reference global storage
const users = global.__users
const posts = global.__posts
const chatMessages = global.__chatMessages
const follows = global.__follows

// User operations
export const createUser = (userData: Omit<User, "id" | "createdAt">) => {
  console.log("=== CREATE USER CALLED ===")
  console.log("User data received:", userData)
  console.log("Current users array length before creation:", users.length)
  console.log("Global users array reference:", global.__users?.length)

  const user: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date(),
  }

  users.push(user)
  console.log("User created with ID:", user.id)
  console.log("Users array length after creation:", users.length)
  console.log("Global users array length after creation:", global.__users?.length)
  console.log("=== CREATE USER COMPLETE ===")

  return user
}

export const findUserByEmail = (email: string) => {
  console.log("=== FIND USER BY EMAIL CALLED ===")
  console.log("Searching for email:", email)
  console.log("Current users array length:", users.length)
  console.log("Global users array length:", global.__users?.length)
  console.log(
    "Users array contents:",
    users.map((u) => ({ id: u.id, email: u.email, username: u.username })),
  )

  const foundUser = users.find((user) => user.email === email)
  console.log("Found user:", foundUser ? { id: foundUser.id, email: foundUser.email } : "NOT FOUND")
  console.log("=== FIND USER BY EMAIL COMPLETE ===")

  return foundUser
}

export const findUserById = (id: string) => {
  return users.find((user) => user.id === id)
}

export const getAllUsers = () => {
  console.log("=== GET ALL USERS CALLED ===")
  console.log("Current users array length:", users.length)
  console.log("Global users array length:", global.__users?.length)
  console.log("Users array reference same as global?", users === global.__users)
  console.log("=== GET ALL USERS COMPLETE ===")

  return users
}

export const searchUsers = (query: string) => {
  return users.filter(
    (user) =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()),
  )
}

// Post operations
export const createPost = (postData: Omit<Post, "id" | "createdAt" | "likes" | "comments">) => {
  const post: Post = {
    ...postData,
    id: Date.now().toString(),
    createdAt: new Date(),
    likes: [],
    comments: [],
  }
  posts.push(post)
  return post
}

export const getAllPosts = () => posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

export const getPostById = (id: string) => {
  return posts.find((post) => post.id === id)
}

export const getUserPosts = (userId: string) => {
  return posts.filter((post) => post.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export const deletePost = (id: string) => {
  const index = posts.findIndex((post) => post.id === id)
  if (index > -1) {
    posts.splice(index, 1)
    return true
  }
  return false
}

export const searchPosts = (query: string) => {
  return posts
    .filter((post) => post.content.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Like operations
export const toggleLike = (postId: string, userId: string) => {
  const post = getPostById(postId)
  if (!post) return null

  const likeIndex = post.likes.indexOf(userId)
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1)
  } else {
    post.likes.push(userId)
  }
  return post
}

// Comment operations
export const addComment = (postId: string, userId: string, username: string, content: string) => {
  const post = getPostById(postId)
  if (!post) return null

  const comment: Comment = {
    id: Date.now().toString(),
    userId,
    username,
    content,
    createdAt: new Date(),
  }
  post.comments.push(comment)
  return post
}

// Chat operations
export const getChatMessages = (userId1: string, userId2: string) => {
  return chatMessages
    .filter(
      (msg) =>
        (msg.fromUserId === userId1 && msg.toUserId === userId2) ||
        (msg.fromUserId === userId2 && msg.toUserId === userId1),
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

export const sendMessage = (fromUserId: string, toUserId: string, content: string) => {
  const message: ChatMessage = {
    id: Date.now().toString(),
    fromUserId,
    toUserId,
    content,
    createdAt: new Date(),
  }
  chatMessages.push(message)
  return message
}

// Follow operations
export const toggleFollow = (followerId: string, followingId: string) => {
  const existingFollow = follows.find((f) => f.followerId === followerId && f.followingId === followingId)

  if (existingFollow) {
    const index = follows.indexOf(existingFollow)
    follows.splice(index, 1)
    return false // unfollowed
  } else {
    follows.push({ followerId, followingId })
    return true // followed
  }
}

export const isFollowing = (followerId: string, followingId: string) => {
  return follows.some((f) => f.followerId === followerId && f.followingId === followingId)
}
