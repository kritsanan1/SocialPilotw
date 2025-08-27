import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ayrshareClient } from "@/lib/ayrshare-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Clock, TrendingUp, Heart, Reply, Flag } from "lucide-react";

// Mock user ID
const MOCK_USER_ID = "user-1";

export default function Comments() {
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: comments, isLoading } = useQuery({
    queryKey: ['/api/comments', MOCK_USER_ID],
    queryFn: () => ayrshareClient.getUserComments(MOCK_USER_ID),
  });

  const filteredComments = comments?.filter(comment => {
    if (platformFilter !== "all" && comment.platform !== platformFilter) return false;
    if (statusFilter !== "all") {
      if (statusFilter === "pending" && comment.isReplied) return false;
      if (statusFilter === "replied" && !comment.isReplied) return false;
    }
    return true;
  }) || [];

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-blue-400 text-white';
      case 'instagram': return 'bg-pink-400 text-white';
      case 'facebook': return 'bg-blue-500 text-white';
      case 'linkedin': return 'bg-blue-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const char = platform.charAt(0).toUpperCase();
    return char;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Calculate stats
  const totalComments = comments?.length || 0;
  const pendingReplies = comments?.filter(comment => !comment.isReplied).length || 0;
  const responseRate = totalComments > 0 ? Math.round(((totalComments - pendingReplies) / totalComments) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Social Comments</h1>
          <p className="text-muted-foreground">Monitor and respond to comments across all platforms</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-40 mobile-touch" data-testid="select-platform-filter">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 mobile-touch" data-testid="select-status-filter">
              <SelectValue placeholder="All Comments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="gradient-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                <p className="text-xl lg:text-2xl font-bold text-foreground" data-testid="text-total-comments">
                  {totalComments.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Replies</p>
                <p className="text-xl lg:text-2xl font-bold text-chart-3" data-testid="text-pending-replies">
                  {pendingReplies}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-xl lg:text-2xl font-bold text-chart-2" data-testid="text-response-rate">
                  {responseRate}%
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments List */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Recent Comments ({filteredComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {filteredComments.length > 0 ? (
            filteredComments.slice(0, 10).map((comment) => (
              <div key={comment.id} className="py-4 lg:py-6 first:pt-0 last:pb-0">
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getPlatformColor(comment.platform)}`}>
                    <span className="text-xs font-medium">
                      {getPlatformIcon(comment.platform)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-2 mb-2">
                      <p className="font-medium text-foreground">{comment.authorDisplayName || comment.authorUsername}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium self-start ${getPlatformColor(comment.platform)}`}>
                        {comment.platform}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground mb-4 text-sm lg:text-base">{comment.content}</p>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 mobile-touch"
                        data-testid={`button-reply-${comment.id}`}
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground mobile-touch"
                        data-testid={`button-like-${comment.id}`}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Like
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground mobile-touch"
                        data-testid={`button-flag-${comment.id}`}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Flag
                      </Button>
                      {comment.isReplied && (
                        <span className="px-2 py-1 bg-chart-2/20 text-chart-2 rounded text-xs font-medium">
                          Replied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No comments found</p>
              <p className="text-sm text-muted-foreground">
                {platformFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters to see more comments"
                  : "Comments will appear here when people interact with your posts"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
