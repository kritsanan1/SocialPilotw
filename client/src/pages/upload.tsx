import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ayrshareClient } from "@/lib/ayrshare-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Calendar, 
  Hash, 
  Link, 
  Send, 
  Save, 
  Clock,
  CloudUpload,
  Image,
  Video,
  Heart
} from "lucide-react";

// Mock user ID
const MOCK_USER_ID = "user-1";

interface PostForm {
  content: string;
  platforms: string[];
  mediaUrls: string[];
  scheduleDate?: string;
}

export default function UploadPage() {
  const [postForm, setPostForm] = useState<PostForm>({
    content: "",
    platforms: [],
    mediaUrls: [],
  });
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/user', MOCK_USER_ID],
    queryFn: () => ayrshareClient.getUserSocialAccounts(MOCK_USER_ID),
  });

  const createPostMutation = useMutation({
    mutationFn: (postData: {
      userId: string;
      content: string;
      platforms: string[];
      mediaUrls?: string[];
      scheduledAt?: string;
    }) => ayrshareClient.createPost(postData),
    onSuccess: () => {
      toast({
        title: "Post created successfully!",
        description: "Your post has been published to the selected platforms.",
      });
      // Reset form
      setPostForm({
        content: "",
        platforms: [],
        mediaUrls: [],
      });
      // Invalidate posts cache
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast({
        title: "Error creating post",
        description: "Please check your content and try again.",
        variant: "destructive",
      });
    },
  });

  const handleContentChange = (content: string) => {
    setPostForm(prev => ({ ...prev, content }));
  };

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    setPostForm(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const handlePublishNow = () => {
    if (!postForm.content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    if (postForm.platforms.length === 0) {
      toast({
        title: "Platform required",
        description: "Please select at least one platform to post to.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      userId: MOCK_USER_ID,
      content: postForm.content,
      platforms: postForm.platforms,
      mediaUrls: postForm.mediaUrls,
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your post has been saved as a draft.",
    });
  };

  const handleSchedule = () => {
    toast({
      title: "Scheduling feature",
      description: "Scheduling functionality will be available soon.",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
    toast({
      title: "File upload",
      description: "File upload functionality will be available soon.",
    });
  };

  const getPlatformDetails = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return { name: 'Twitter', color: 'platform-twitter', icon: 'T' };
      case 'instagram':
        return { name: 'Instagram', color: 'platform-instagram', icon: 'I' };
      case 'facebook':
        return { name: 'Facebook', color: 'platform-facebook', icon: 'F' };
      case 'linkedin':
        return { name: 'LinkedIn', color: 'platform-linkedin', icon: 'L' };
      case 'youtube':
        return { name: 'YouTube', color: 'platform-youtube', icon: 'Y' };
      case 'tiktok':
        return { name: 'TikTok', color: 'platform-tiktok', icon: 'T' };
      default:
        return { name: platform, color: 'bg-gray-500', icon: platform.charAt(0).toUpperCase() };
    }
  };

  const connectedAccounts = userAccounts?.socialAccounts.filter(account => account.isConnected) || [];

  if (accountsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Upload Posts</h1>
        <p className="text-muted-foreground">Create and publish content across all your social platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Composer */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Compose Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={postForm.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-32 resize-none"
                data-testid="textarea-post-content"
              />
              
              {/* Media Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 lg:p-8 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => toast({ title: "File upload", description: "File upload functionality will be available soon." })}
                data-testid="div-media-upload"
              >
                <CloudUpload className="w-8 h-8 lg:w-12 lg:h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">Drag & drop your media here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                <Button variant="outline" className="mobile-touch">
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPG, PNG, GIF, MP4, MOV (Max 100MB)
                </p>
              </div>

              {/* Post Options */}
              <div className="flex flex-wrap gap-2 lg:gap-4">
                <Button
                  variant="outline"
                  className="mobile-touch bg-chart-3/10 hover:bg-chart-3/20 text-chart-3 border-chart-3/20"
                  onClick={handleSchedule}
                  data-testid="button-schedule-option"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
                <Button
                  variant="outline"
                  className="mobile-touch bg-chart-2/10 hover:bg-chart-2/20 text-chart-2 border-chart-2/20"
                  data-testid="button-ai-hashtags"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  AI Hashtags
                </Button>
                <Button
                  variant="outline"
                  className="mobile-touch bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 border-chart-1/20"
                  data-testid="button-shorten-links"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Shorten Links
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Publish Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1 gradient-bg text-primary-foreground mobile-touch"
              onClick={handlePublishNow}
              disabled={createPostMutation.isPending}
              data-testid="button-publish-now"
            >
              <Send className="w-4 h-4 mr-2" />
              {createPostMutation.isPending ? 'Publishing...' : 'Publish Now'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 mobile-touch bg-chart-3/10 hover:bg-chart-3/20 text-chart-3 border-chart-3/20"
              onClick={handleSaveDraft}
              data-testid="button-save-draft"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="outline"
              className="flex-1 mobile-touch bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 border-chart-1/20"
              onClick={handleSchedule}
              data-testid="button-schedule-post"
            >
              <Clock className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Platform Selector */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Select Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {connectedAccounts.length > 0 ? (
                connectedAccounts.map((account) => {
                  const platformDetails = getPlatformDetails(account.platform);
                  const isSelected = postForm.platforms.includes(account.platform);
                  
                  return (
                    <label
                      key={account.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors mobile-touch ${
                        isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/30'
                      }`}
                      data-testid={`label-platform-${account.platform}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handlePlatformToggle(account.platform, checked as boolean)
                        }
                        className="border-border"
                      />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platformDetails.color}`}>
                        <span className="text-white text-sm font-medium">
                          {platformDetails.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{platformDetails.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{account.username} • {account.followerCount?.toLocaleString() || 0} followers
                        </p>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No connected accounts</p>
                  <Button variant="outline" className="mobile-touch">
                    Connect Accounts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Preview */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Your Brand</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <p className="text-sm text-foreground mb-3">
                  {postForm.content || "Your post content will appear here as you type..."}
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    0
                  </span>
                  <span className="flex items-center">
                    <Upload className="w-3 h-3 mr-1" />
                    0
                  </span>
                  <span className="flex items-center">
                    <Send className="w-3 h-3 mr-1" />
                    0
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
