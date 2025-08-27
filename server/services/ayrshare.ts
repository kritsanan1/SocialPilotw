export interface AyrshareConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface AyrsharePostRequest {
  post: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduleDate?: string;
  shortenLinks?: boolean;
  autoHashtag?: boolean;
}

export interface AyrsharePostResponse {
  status: string;
  id?: string;
  postIds?: Record<string, string>;
  refId?: string;
  errors?: any[];
}

export interface AyrshareProfileResponse {
  status: string;
  profiles?: Array<{
    platform: string;
    username: string;
    followers?: number;
    isConnected: boolean;
  }>;
}

export interface AyrshareAnalyticsResponse {
  status: string;
  analytics?: Array<{
    postId: string;
    platform: string;
    likes: number;
    shares: number;
    comments: number;
    views: number;
  }>;
}

export interface AyrshareMessageResponse {
  status: string;
  messages?: Array<{
    id: string;
    platform: string;
    from: string;
    to?: string;
    message: string;
    type: string;
    created: string;
  }>;
}

export class AyrshareClient {
  private config: AyrshareConfig;
  private baseUrl: string;

  constructor(config: AyrshareConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.ayrshare.com/api';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'deflate, gzip, br',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ayrshare API Error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  async createPost(postData: AyrsharePostRequest): Promise<AyrsharePostResponse> {
    return this.makeRequest<AyrsharePostResponse>('/post', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(postId: string): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>(`/delete/${postId}`, {
      method: 'DELETE',
    });
  }

  async getProfiles(): Promise<AyrshareProfileResponse> {
    return this.makeRequest<AyrshareProfileResponse>('/profiles');
  }

  async getAnalytics(postId?: string): Promise<AyrshareAnalyticsResponse> {
    const endpoint = postId ? `/analytics/${postId}` : '/analytics';
    return this.makeRequest<AyrshareAnalyticsResponse>(endpoint);
  }

  async getHistory(limit = 50): Promise<{ status: string; posts?: any[] }> {
    return this.makeRequest<{ status: string; posts?: any[] }>(`/history?limit=${limit}`);
  }

  async getMessages(platform?: string): Promise<AyrshareMessageResponse> {
    const endpoint = platform ? `/messages?platform=${platform}` : '/messages';
    return this.makeRequest<AyrshareMessageResponse>(endpoint);
  }

  async sendMessage(platform: string, to: string, message: string): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/messages', {
      method: 'POST',
      body: JSON.stringify({
        platform,
        to,
        message,
      }),
    });
  }

  async getComments(postId?: string): Promise<{ status: string; comments?: any[] }> {
    const endpoint = postId ? `/comments/${postId}` : '/comments';
    return this.makeRequest<{ status: string; comments?: any[] }>(endpoint);
  }

  async postComment(postId: string, comment: string): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/comments', {
      method: 'POST',
      body: JSON.stringify({
        id: postId,
        comment,
      }),
    });
  }

  async uploadMedia(file: Blob | File): Promise<{ status: string; url?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<{ status: string; url?: string }>('/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });
  }
}

export function createAyrshareClient(apiKey: string): AyrshareClient {
  return new AyrshareClient({ apiKey });
}
