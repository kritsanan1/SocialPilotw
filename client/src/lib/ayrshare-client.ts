import { apiRequest } from './queryClient';
import type { 
  SocialAccount, 
  Post, 
  Message, 
  Comment, 
  Analytics, 
  DashboardMetrics,
  PlatformEngagement,
  Conversation
} from '@/types/social';

export interface DashboardData {
  metrics: DashboardMetrics;
  platformEngagement: PlatformEngagement[];
  recentPosts: Post[];
  analytics: Analytics[];
}

class AyrshareClientAPI {
  async getDashboardData(userId: string): Promise<DashboardData> {
    const response = await apiRequest('GET', `/api/dashboard/${userId}`);
    return response.json();
  }

  async getUserSocialAccounts(userId: string): Promise<{ user: any; socialAccounts: SocialAccount[] }> {
    const response = await apiRequest('GET', `/api/user/${userId}`);
    return response.json();
  }

  async syncProfiles(userId: string): Promise<{ socialAccounts: SocialAccount[] }> {
    const response = await apiRequest('POST', `/api/sync-profiles/${userId}`);
    return response.json();
  }

  async updateUserApiKey(userId: string, apiKey: string): Promise<{ success: boolean }> {
    const response = await apiRequest('POST', `/api/user/${userId}/api-key`, { apiKey });
    return response.json();
  }

  async createPost(postData: {
    userId: string;
    content: string;
    platforms: string[];
    mediaUrls?: string[];
    scheduledAt?: string;
  }): Promise<Post> {
    const response = await apiRequest('POST', '/api/posts', postData);
    return response.json();
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    const response = await apiRequest('GET', `/api/posts/${userId}`);
    return response.json();
  }

  async deletePost(postId: string): Promise<{ success: boolean }> {
    const response = await apiRequest('DELETE', `/api/posts/${postId}`);
    return response.json();
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await apiRequest('GET', `/api/messages/${userId}`);
    return response.json();
  }

  async getUserComments(userId: string): Promise<Comment[]> {
    const response = await apiRequest('GET', `/api/comments/${userId}`);
    return response.json();
  }

  async getUserAnalytics(userId: string, platform?: string): Promise<Analytics[]> {
    const url = platform 
      ? `/api/analytics/${userId}?platform=${platform}`
      : `/api/analytics/${userId}`;
    const response = await apiRequest('GET', url);
    return response.json();
  }
}

export const ayrshareClient = new AyrshareClientAPI();
