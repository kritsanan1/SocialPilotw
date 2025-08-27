import { 
  users, 
  socialAccounts, 
  posts, 
  messages, 
  comments, 
  analytics,
  type User, 
  type InsertUser,
  type SocialAccount,
  type InsertSocialAccount,
  type Post,
  type InsertPost,
  type Message,
  type InsertMessage,
  type Comment,
  type InsertComment,
  type Analytics,
  type InsertAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApiKey(id: string, apiKey: string): Promise<void>;

  // Social Accounts
  getUserSocialAccounts(userId: string): Promise<SocialAccount[]>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: string, data: Partial<SocialAccount>): Promise<void>;
  deleteSocialAccount(id: string): Promise<void>;

  // Posts
  getUserPosts(userId: string, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, data: Partial<Post>): Promise<void>;
  deletePost(id: string): Promise<void>;
  getPostById(id: string): Promise<Post | undefined>;

  // Messages
  getUserMessages(userId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getConversations(userId: string): Promise<{ conversationId: string; platform: string; lastMessage: Message }[]>;

  // Comments
  getUserComments(userId: string, limit?: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, data: Partial<Comment>): Promise<void>;

  // Analytics
  getUserAnalytics(userId: string, limit?: number): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByPlatform(userId: string, platform: string): Promise<Analytics[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserApiKey(id: string, apiKey: string): Promise<void> {
    await db.update(users).set({ ayrshareApiKey: apiKey }).where(eq(users.id, id));
  }

  async getUserSocialAccounts(userId: string): Promise<SocialAccount[]> {
    return await db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const [socialAccount] = await db
      .insert(socialAccounts)
      .values(account)
      .returning();
    return socialAccount;
  }

  async updateSocialAccount(id: string, data: Partial<SocialAccount>): Promise<void> {
    await db.update(socialAccounts).set(data).where(eq(socialAccounts.id, id));
  }

  async deleteSocialAccount(id: string): Promise<void> {
    await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
  }

  async getUserPosts(userId: string, limit = 50): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async updatePost(id: string, data: Partial<Post>): Promise<void> {
    await db.update(posts).set(data).where(eq(posts.id, id));
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getUserMessages(userId: string, limit = 100): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getConversations(userId: string): Promise<{ conversationId: string; platform: string; lastMessage: Message }[]> {
    const userMessages = await this.getUserMessages(userId);
    const conversationMap = new Map<string, { platform: string; lastMessage: Message }>();
    
    for (const message of userMessages) {
      const key = `${message.conversationId}-${message.platform}`;
      if (!conversationMap.has(key) || 
          (conversationMap.get(key)!.lastMessage.createdAt! < message.createdAt!)) {
        conversationMap.set(key, { platform: message.platform, lastMessage: message });
      }
    }

    return Array.from(conversationMap.entries()).map(([key, data]) => ({
      conversationId: key.split('-')[0],
      platform: data.platform,
      lastMessage: data.lastMessage
    }));
  }

  async getUserComments(userId: string, limit = 100): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.userId, userId))
      .orderBy(desc(comments.createdAt))
      .limit(limit);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async updateComment(id: string, data: Partial<Comment>): Promise<void> {
    await db.update(comments).set(data).where(eq(comments.id, id));
  }

  async getUserAnalytics(userId: string, limit = 100): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(eq(analytics.userId, userId))
      .orderBy(desc(analytics.date))
      .limit(limit);
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db
      .insert(analytics)
      .values(analyticsData)
      .returning();
    return newAnalytics;
  }

  async getAnalyticsByPlatform(userId: string, platform: string): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(and(eq(analytics.userId, userId), eq(analytics.platform, platform)))
      .orderBy(desc(analytics.date));
  }
}

export const storage = new DatabaseStorage();
