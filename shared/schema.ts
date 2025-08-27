import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  ayrshareApiKey: text("ayrshare_api_key"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const socialAccounts = pgTable("social_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // twitter, instagram, facebook, etc.
  accountId: text("account_id").notNull(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  followerCount: integer("follower_count"),
  isConnected: boolean("is_connected").default(true),
  connectionData: jsonb("connection_data"), // platform-specific data
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  platforms: jsonb("platforms").$type<string[]>().notNull(), // array of platform names
  mediaUrls: jsonb("media_urls").$type<string[]>(), // array of media URLs
  ayrsharePostId: text("ayrshare_post_id"),
  socialPostIds: jsonb("social_post_ids").$type<Record<string, string>>(), // platform -> post_id mapping
  status: text("status").notNull().default("draft"), // draft, scheduled, published, failed
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").notNull(),
  platform: text("platform").notNull(),
  fromUsername: text("from_username").notNull(),
  toUsername: text("to_username"),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, image, video
  isInbound: boolean("is_inbound").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  socialCommentId: text("social_comment_id").notNull(),
  content: text("content").notNull(),
  authorUsername: text("author_username").notNull(),
  authorDisplayName: text("author_display_name"),
  isReplied: boolean("is_replied").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  views: integer("views").default(0),
  engagement: integer("engagement").default(0),
  date: timestamp("date").default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  socialAccounts: many(socialAccounts),
  posts: many(posts),
  messages: many(messages),
  comments: many(comments),
  analytics: many(analytics),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  user: one(users, {
    fields: [socialAccounts.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  analytics: many(analytics),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [analytics.postId],
    references: [posts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
  ayrsharePostId: true,
  socialPostIds: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  date: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
