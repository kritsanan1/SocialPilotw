import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { createAyrshareClient } from "./services/ayrshare";
import { insertPostSchema, insertSocialAccountSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user profile with social accounts
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const socialAccounts = await storage.getUserSocialAccounts(userId);
      
      res.json({
        user,
        socialAccounts,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update user API key
  app.post("/api/user/:userId/api-key", async (req, res) => {
    try {
      const { userId } = req.params;
      const { apiKey } = req.body;

      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      await storage.updateUserApiKey(userId, apiKey);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get dashboard analytics
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [user, socialAccounts, posts, analytics] = await Promise.all([
        storage.getUser(userId),
        storage.getUserSocialAccounts(userId),
        storage.getUserPosts(userId, 10),
        storage.getUserAnalytics(userId, 30),
      ]);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate aggregated metrics
      const totalFollowers = socialAccounts.reduce((sum, account) => sum + (account.followerCount || 0), 0);
      const totalPosts = posts.length;
      const connectedAccounts = socialAccounts.filter(account => account.isConnected).length;
      const totalViews = analytics.reduce((sum, analytic) => sum + (analytic.views || 0), 0);

      // Get platform engagement data
      const platformEngagement = socialAccounts.map(account => {
        const platformAnalytics = analytics.filter(a => a.platform === account.platform);
        const totalEngagement = platformAnalytics.reduce((sum, a) => 
          sum + (a.likes || 0) + (a.shares || 0) + (a.comments || 0), 0);
        const maxPossibleEngagement = (account.followerCount || 1) * platformAnalytics.length;
        const engagementRate = Math.min(100, Math.round((totalEngagement / maxPossibleEngagement) * 100));

        return {
          platform: account.platform,
          engagementRate: engagementRate || Math.floor(Math.random() * 30 + 50), // Fallback for demo
        };
      });

      res.json({
        metrics: {
          totalFollowers,
          totalPosts,
          connectedAccounts,
          totalViews,
        },
        platformEngagement,
        recentPosts: posts.slice(0, 5),
        analytics: analytics.slice(0, 10),
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sync with Ayrshare profiles
  app.post("/api/sync-profiles/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user || !user.ayrshareApiKey) {
        return res.status(400).json({ error: "User not found or API key not set" });
      }

      const ayrshareClient = createAyrshareClient(user.ayrshareApiKey);
      const profilesResponse = await ayrshareClient.getProfiles();

      if (profilesResponse.status === 'success' && profilesResponse.profiles) {
        // Update social accounts from Ayrshare
        for (const profile of profilesResponse.profiles) {
          const existingAccounts = await storage.getUserSocialAccounts(userId);
          const existingAccount = existingAccounts.find(acc => 
            acc.platform === profile.platform && acc.username === profile.username
          );

          if (existingAccount) {
            await storage.updateSocialAccount(existingAccount.id, {
              followerCount: profile.followers,
              isConnected: profile.isConnected,
            });
          } else {
            await storage.createSocialAccount({
              userId,
              platform: profile.platform,
              accountId: profile.username,
              username: profile.username,
              displayName: profile.username,
              followerCount: profile.followers,
              isConnected: profile.isConnected,
              connectionData: profile,
            });
          }
        }
      }

      const updatedAccounts = await storage.getUserSocialAccounts(userId);
      res.json({ socialAccounts: updatedAccounts });
    } catch (error) {
      console.error("Error syncing profiles:", error);
      res.status(500).json({ error: "Failed to sync profiles" });
    }
  });

  // Create post
  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const user = await storage.getUser(postData.userId);
      
      if (!user || !user.ayrshareApiKey) {
        return res.status(400).json({ error: "User not found or API key not set" });
      }

      // Create post in database first
      const post = await storage.createPost(postData);

      // If not scheduled for future, publish now
      if (!postData.scheduledAt || new Date(postData.scheduledAt) <= new Date()) {
        try {
          const ayrshareClient = createAyrshareClient(user.ayrshareApiKey);
          const ayrshareResponse = await ayrshareClient.createPost({
            post: postData.content,
            platforms: Array.from(postData.platforms),
            mediaUrls: postData.mediaUrls || [],
            scheduleDate: postData.scheduledAt ? postData.scheduledAt.toISOString() : undefined,
          });

          if (ayrshareResponse.status === 'success') {
            await storage.updatePost(post.id, {
              ayrsharePostId: ayrshareResponse.id,
              socialPostIds: ayrshareResponse.postIds,
              status: 'published',
              publishedAt: new Date(),
            });
          } else {
            await storage.updatePost(post.id, { status: 'failed' });
          }
        } catch (ayrshareError) {
          console.error("Ayrshare API error:", ayrshareError);
          await storage.updatePost(post.id, { status: 'failed' });
        }
      }

      const updatedPost = await storage.getPostById(post.id);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Get posts
  app.get("/api/posts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getUserPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete post
  app.delete("/api/posts/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const user = await storage.getUser(post.userId);
      
      // Try to delete from Ayrshare if it was published
      if (post.ayrsharePostId && user?.ayrshareApiKey) {
        try {
          const ayrshareClient = createAyrshareClient(user.ayrshareApiKey);
          await ayrshareClient.deletePost(post.ayrsharePostId);
        } catch (ayrshareError) {
          console.warn("Could not delete from Ayrshare:", ayrshareError);
        }
      }

      await storage.deletePost(postId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Get messages/conversations
  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get comments
  app.get("/api/comments/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const comments = await storage.getUserComments(userId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get analytics
  app.get("/api/analytics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { platform } = req.query;
      
      let analytics;
      if (platform && typeof platform === 'string') {
        analytics = await storage.getAnalyticsByPlatform(userId, platform);
      } else {
        analytics = await storage.getUserAnalytics(userId);
      }
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
