import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ayrshareClient } from "@/lib/ayrshare-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";

// Mock user ID
const MOCK_USER_ID = "user-1";

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts', MOCK_USER_ID],
    queryFn: () => ayrshareClient.getUserPosts(MOCK_USER_ID),
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === today.toDateString();
      
      // Find posts for this date
      const dayPosts = posts?.filter(post => {
        const postDate = post.scheduledAt ? new Date(post.scheduledAt) : new Date(post.createdAt!);
        return postDate.toDateString() === date.toDateString();
      }) || [];

      days.push({
        date,
        isCurrentMonth,
        isToday,
        posts: dayPosts,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const calendarDays = generateCalendarDays();
  const scheduledPosts = posts?.filter(post => post.status === 'scheduled').slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Content Calendar</h1>
          <p className="text-muted-foreground">Plan and schedule your social media content</p>
        </div>
        <Button className="gradient-bg text-primary-foreground mobile-touch" data-testid="button-schedule-post">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card className="gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="mobile-touch"
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg lg:text-xl font-semibold text-foreground">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="mobile-touch"
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={`mobile-touch capitalize ${viewMode === mode ? 'bg-primary text-primary-foreground' : ''}`}
                  data-testid={`button-view-${mode}`}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
            {/* Headers */}
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-2 lg:p-4 text-center font-medium text-muted-foreground border-b border-border bg-muted/50 text-sm lg:text-base"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`p-1 lg:p-2 h-20 lg:h-32 border-b border-r border-border relative ${
                  !day.isCurrentMonth ? 'bg-muted/30' : ''
                } ${day.isToday ? 'bg-primary/10' : ''}`}
                data-testid={`calendar-day-${day.date.getDate()}`}
              >
                <div className={`text-xs lg:text-sm mb-1 lg:mb-2 ${
                  day.isToday 
                    ? 'font-bold text-primary' 
                    : day.isCurrentMonth 
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                }`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {day.posts.slice(0, 2).map((post, postIndex) => (
                    <div
                      key={post.id}
                      className={`text-xs p-1 rounded truncate ${
                        post.platforms.includes('twitter') ? 'bg-blue-100 text-blue-800' :
                        post.platforms.includes('instagram') ? 'bg-pink-100 text-pink-800' :
                        post.platforms.includes('linkedin') ? 'bg-blue-200 text-blue-900' :
                        'bg-gray-100 text-gray-800'
                      }`}
                      data-testid={`post-${post.id}`}
                    >
                      {post.content.substring(0, 20)}...
                    </div>
                  ))}
                  {day.posts.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{day.posts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Posts */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Upcoming Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduledPosts.length > 0 ? (
            scheduledPosts.map((post) => (
              <div key={post.id} className="flex items-center space-x-4 p-3 lg:p-4 bg-muted/30 rounded-lg">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  post.platforms.includes('twitter') ? 'bg-blue-400' :
                  post.platforms.includes('instagram') ? 'bg-pink-400' :
                  post.platforms.includes('linkedin') ? 'bg-blue-600' :
                  'bg-gray-400'
                }`}>
                  <span className="text-white text-xs font-medium">
                    {post.platforms[0]?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{post.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="mobile-touch" data-testid={`button-edit-${post.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="mobile-touch text-destructive hover:text-destructive" data-testid={`button-delete-${post.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No scheduled posts found</p>
              <Button variant="outline" className="mobile-touch" data-testid="button-create-first-scheduled-post">
                Create First Scheduled Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
