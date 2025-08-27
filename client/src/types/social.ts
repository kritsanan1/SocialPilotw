export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  isConnected: boolean;
  username?: string;
  followers?: number;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: string;
  accountId: string;
  username: string;
  displayName?: string;
  followerCount?: number;
  isConnected: boolean;
  connectionData?: any;
  createdAt?: Date;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  platforms: string[];
  mediaUrls?: string[];
  ayrsharePostId?: string;
  socialPostIds?: Record<string, string>;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt?: Date;
}

export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  platform: string;
  fromUsername: string;
  toUsername?: string;
  content: string;
  messageType: 'text' | 'image' | 'video';
  isInbound: boolean;
  readAt?: Date;
  createdAt?: Date;
}

export interface Comment {
  id: string;
  userId: string;
  postId?: string;
  platform: string;
  socialCommentId: string;
  content: string;
  authorUsername: string;
  authorDisplayName?: string;
  isReplied: boolean;
  createdAt?: Date;
}

export interface Analytics {
  id: string;
  userId: string;
  postId?: string;
  platform: string;
  likes: number;
  shares: number;
  comments: number;
  views: number;
  engagement: number;
  date?: Date;
}

export interface DashboardMetrics {
  totalFollowers: number;
  totalPosts: number;
  connectedAccounts: number;
  totalViews: number;
}

export interface PlatformEngagement {
  platform: string;
  engagementRate: number;
}

export interface Conversation {
  conversationId: string;
  platform: string;
  lastMessage: Message;
}
