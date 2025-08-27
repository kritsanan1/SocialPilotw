import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ayrshareClient } from "@/lib/ayrshare-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Link, 
  Globe, 
  CheckCircle, 
  RefreshCw, 
  Unlink, 
  Settings,
  Users,
  Plus,
  AlertCircle
} from "lucide-react";

// Mock user ID
const MOCK_USER_ID = "user-1";

interface Platform {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isSupported: boolean;
}

const availablePlatforms: Platform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Share tweets, threads, and engage with your audience on X platform.',
    color: 'bg-blue-400 hover:bg-blue-500',
    icon: 'T',
    isSupported: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Post photos, videos, stories, and reels to your Instagram account.',
    color: 'bg-pink-400 hover:bg-pink-500',
    icon: 'I',
    isSupported: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Share professional content and connect with your business network.',
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: 'L',
    isSupported: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Manage your Facebook pages and share content with your community.',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: 'F',
    isSupported: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Upload and manage your YouTube videos and community posts.',
    color: 'bg-red-500 hover:bg-red-600',
    icon: 'Y',
    isSupported: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Create and share short-form video content on TikTok.',
    color: 'bg-black hover:bg-gray-800',
    icon: 'T',
    isSupported: true,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Share visual content and ideas on Pinterest boards.',
    color: 'bg-red-600 hover:bg-red-700',
    icon: 'P',
    isSupported: true,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    description: 'Engage with communities and share content on Reddit.',
    color: 'bg-orange-500 hover:bg-orange-600',
    icon: 'R',
    isSupported: true,
  },
];

export default function ConnectSocials() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userAccounts, isLoading, error } = useQuery({
    queryKey: ['/api/user', MOCK_USER_ID],
    queryFn: () => ayrshareClient.getUserSocialAccounts(MOCK_USER_ID),
    retry: false,
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: (apiKey: string) => ayrshareClient.updateUserApiKey(MOCK_USER_ID, apiKey),
    onSuccess: () => {
      toast({
        title: "API Key updated successfully!",
        description: "You can now sync your social media profiles.",
      });
      setShowApiKeyInput(false);
      setApiKey("");
      // Invalidate user data to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      console.error("Error updating API key:", error);
      toast({
        title: "Error updating API key",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
    },
  });

  const syncProfilesMutation = useMutation({
    mutationFn: () => ayrshareClient.syncProfiles(MOCK_USER_ID),
    onSuccess: (data) => {
      toast({
        title: "Profiles synced successfully!",
        description: `Updated ${data.socialAccounts.length} social accounts.`,
      });
      // Invalidate user data to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      console.error("Error syncing profiles:", error);
      toast({
        title: "Error syncing profiles",
        description: "Please check your API configuration and try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "API Key required",
        description: "Please enter your Ayrshare API key.",
        variant: "destructive",
      });
      return;
    }
    updateApiKeyMutation.mutate(apiKey);
  };

  const handleSyncProfiles = () => {
    syncProfilesMutation.mutate();
  };

  const handleConnectPlatform = (platformId: string) => {
    toast({
      title: "Connect Platform",
      description: `OAuth connection for ${platformId} will be available soon.`,
    });
  };

  const handleDisconnectAccount = (accountId: string) => {
    toast({
      title: "Disconnect Account",
      description: "Account disconnection functionality will be available soon.",
    });
  };

  const connectedAccounts = userAccounts?.socialAccounts || [];
  const connectedPlatforms = new Set(connectedAccounts.map(account => account.platform));
  const hasApiKey = userAccounts?.user?.ayrshareApiKey;

  // Calculate stats
  const connectedCount = connectedAccounts.filter(account => account.isConnected).length;
  const totalPlatforms = availablePlatforms.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Connect Socials</h1>
        <p className="text-muted-foreground">Link your social media accounts to start managing them with SocialSync</p>
      </div>

      {/* API Key Configuration */}
      {(!hasApiKey || error) && (
        <Card className="gradient-card border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-foreground">API Configuration Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to configure your Ayrshare API key to connect and manage your social media accounts.
            </p>
            
            {!showApiKeyInput ? (
              <Button 
                onClick={() => setShowApiKeyInput(true)}
                className="mobile-touch"
                data-testid="button-configure-api"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure API Key
              </Button>
            ) : (
              <form onSubmit={handleUpdateApiKey} className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">Ayrshare API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Ayrshare API key"
                    className="mt-1"
                    data-testid="input-api-key"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your API key from the <a href="https://www.ayrshare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ayrshare Dashboard</a>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateApiKeyMutation.isPending}
                    className="mobile-touch"
                    data-testid="button-save-api-key"
                  >
                    {updateApiKeyMutation.isPending ? 'Saving...' : 'Save API Key'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowApiKeyInput(false)}
                    className="mobile-touch"
                    data-testid="button-cancel-api-key"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="gradient-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Accounts</p>
                <p className="text-xl lg:text-2xl font-bold text-chart-2" data-testid="text-connected-accounts">
                  {connectedCount}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <Link className="w-5 h-5 lg:w-6 lg:h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Platforms</p>
                <p className="text-xl lg:text-2xl font-bold text-chart-1" data-testid="text-available-platforms">
                  {totalPlatforms}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Status</p>
                <p className="text-xl lg:text-2xl font-bold text-chart-4" data-testid="text-profile-status">
                  {hasApiKey ? 'Active' : 'Setup Required'}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {availablePlatforms.map((platform) => {
          const isConnected = connectedPlatforms.has(platform.id);
          const connectedAccount = connectedAccounts.find(acc => acc.platform === platform.id);
          
          return (
            <Card key={platform.id} className="gradient-card hover:shadow-xl transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 ${platform.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-lg font-bold">{platform.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">{platform.name}</p>
                    </div>
                  </div>
                  {isConnected && (
                    <div className="w-6 h-6 bg-chart-2 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{platform.description}</p>
                
                {isConnected && connectedAccount ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium text-foreground">@{connectedAccount.username}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Followers:</span>
                      <span className="font-medium text-foreground">
                        {connectedAccount.followerCount?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={connectedAccount.isConnected ? "default" : "secondary"}>
                        {connectedAccount.isConnected ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 mobile-touch text-destructive hover:text-destructive"
                      onClick={() => handleDisconnectAccount(connectedAccount.id)}
                      data-testid={`button-disconnect-${platform.id}`}
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    className={`w-full mobile-touch ${platform.color} text-white`}
                    onClick={() => handleConnectPlatform(platform.id)}
                    disabled={!hasApiKey}
                    data-testid={`button-connect-${platform.id}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connected Accounts Management */}
      {connectedAccounts.length > 0 && (
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Connected Accounts ({connectedAccounts.length})
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleSyncProfiles}
              disabled={syncProfilesMutation.isPending || !hasApiKey}
              className="mobile-touch bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 border-chart-1/20"
              data-testid="button-sync-profiles"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncProfilesMutation.isPending ? 'animate-spin' : ''}`} />
              {syncProfilesMutation.isPending ? 'Syncing...' : 'Refresh Status'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedAccounts.map((account) => {
              const platform = availablePlatforms.find(p => p.id === account.platform);
              
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 lg:p-4 bg-muted/30 rounded-lg"
                  data-testid={`account-${account.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 ${platform?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-medium">{platform?.icon || account.platform.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">@{account.username}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {account.platform} • {account.followerCount?.toLocaleString() || 0} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={account.isConnected ? "default" : "secondary"}>
                      {account.isConnected ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mobile-touch text-muted-foreground hover:text-destructive"
                      onClick={() => handleDisconnectAccount(account.id)}
                      data-testid={`button-disconnect-account-${account.id}`}
                    >
                      <Unlink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
