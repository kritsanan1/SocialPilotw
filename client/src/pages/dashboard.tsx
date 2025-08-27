import { useQuery } from "@tanstack/react-query";
import { ayrshareClient } from "@/lib/ayrshare-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, Users, FileText, Link, Eye } from "lucide-react";
import { useLocation } from "wouter";

// Mock user ID - in real app this would come from auth context
const MOCK_USER_ID = "user-1";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard', MOCK_USER_ID],
    queryFn: () => ayrshareClient.getDashboardData(MOCK_USER_ID),
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground mb-4">Unable to load dashboard data. Please check your API configuration.</p>
          <Button onClick={() => setLocation('/connect-socials')} variant="outline">
            Configure API Settings
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics, platformEngagement, recentPosts } = dashboardData || {
    metrics: { totalFollowers: 0, totalPosts: 0, connectedAccounts: 0, totalViews: 0 },
    platformEngagement: [],
    recentPosts: []
  };

  const statCards = [
    {
      title: "Total Followers",
      value: metrics.totalFollowers.toLocaleString(),
      icon: Users,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      change: "+12%",
    },
    {
      title: "Total Posts",
      value: metrics.totalPosts.toString(),
      icon: FileText,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      change: "+8%",
    },
    {
      title: "Connected Accounts",
      value: metrics.connectedAccounts.toString(),
      icon: Link,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      change: "+2",
    },
    {
      title: "Total Views",
      value: `${(metrics.totalViews / 1000).toFixed(1)}K`,
      icon: Eye,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
      change: "+24%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Social Dashboard</h1>
        <p className="text-muted-foreground">Monitor your social media performance across all platforms</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="gradient-card" data-testid={`card-stat-${index}`}>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className={`text-xl lg:text-2xl font-bold ${stat.color}`} data-testid={`text-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-chart-2 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Platform Engagement */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Platform Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {platformEngagement.length > 0 ? (
              platformEngagement.map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center platform-${platform.platform.toLowerCase()}`}>
                      <span className="text-xs font-medium text-white">
                        {platform.platform.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-foreground font-medium capitalize">{platform.platform}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className={`bg-chart-1 h-2 rounded-full`}
                        style={{ width: `${platform.engagementRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{platform.engagementRate}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No engagement data available</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setLocation('/connect-socials')}
                  data-testid="button-connect-accounts"
                >
                  Connect Social Accounts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.length > 0 ? (
              recentPosts.slice(0, 4).map((post, index) => (
                <div key={post.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{post.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.publishedAt 
                        ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                        : `Created ${new Date(post.createdAt!).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setLocation('/upload')}
                  data-testid="button-create-post"
                >
                  Create First Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              onClick={() => setLocation('/upload')}
              data-testid="button-create-post-action"
            >
              <div className="w-6 h-6 bg-current rounded"></div>
              <span className="text-sm font-medium">Create Post</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 border-chart-1/20"
              data-testid="button-view-analytics"
            >
              <div className="w-6 h-6 bg-current rounded"></div>
              <span className="text-sm font-medium">View Analytics</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-chart-2/10 hover:bg-chart-2/20 text-chart-2 border-chart-2/20"
              onClick={() => setLocation('/calendar')}
              data-testid="button-schedule-content"
            >
              <div className="w-6 h-6 bg-current rounded"></div>
              <span className="text-sm font-medium">Schedule Content</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-chart-4/10 hover:bg-chart-4/20 text-chart-4 border-chart-4/20"
              onClick={() => setLocation('/connect-socials')}
              data-testid="button-connect-account"
            >
              <div className="w-6 h-6 bg-current rounded"></div>
              <span className="text-sm font-medium">Connect Account</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
