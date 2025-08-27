import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ayrshareClient } from "@/lib/ayrshare-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Send } from "lucide-react";

// Mock user ID
const MOCK_USER_ID = "user-1";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['/api/messages', MOCK_USER_ID],
    queryFn: () => ayrshareClient.getConversations(MOCK_USER_ID),
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;
    
    console.log('Sending message:', messageText, 'to:', selectedConversation);
    setMessageText("");
  };

  const filteredConversations = conversations?.filter(conv =>
    conv.lastMessage.fromUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedConversationData = conversations?.find(conv => 
    conv.conversationId === selectedConversation
  );

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-blue-400';
      case 'instagram': return 'bg-pink-400';
      case 'facebook': return 'bg-blue-500';
      case 'linkedin': return 'bg-blue-600';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
          <Skeleton className="lg:col-span-1 h-full" />
          <Skeleton className="lg:col-span-3 h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Social Messages</h1>
        <p className="text-muted-foreground">Manage conversations across all your social platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="gradient-card h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-conversations"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {filteredConversations.length > 0 ? (
                <div className="space-y-0">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={`${conversation.conversationId}-${conversation.platform}`}
                      onClick={() => setSelectedConversation(conversation.conversationId)}
                      className={`w-full p-4 border-b border-border hover:bg-muted/30 transition-colors text-left ${
                        selectedConversation === conversation.conversationId ? 'bg-muted/50' : ''
                      }`}
                      data-testid={`conversation-${conversation.conversationId}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 lg:w-10 lg:h-10 ${getPlatformColor(conversation.platform)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-medium">
                            {conversation.platform.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {conversation.lastMessage.fromUsername}
                            </p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(conversation.lastMessage.createdAt!).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                          {!conversation.lastMessage.readAt && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="gradient-card h-full flex flex-col">
            {selectedConversationData ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 ${getPlatformColor(selectedConversationData.platform)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-medium">
                        {selectedConversationData.platform.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedConversationData.lastMessage.fromUsername}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedConversationData.platform} • Active recently
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 lg:w-8 lg:h-8 ${getPlatformColor(selectedConversationData.platform)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-medium">
                        {selectedConversationData.lastMessage.fromUsername.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 max-w-xs lg:max-w-md">
                      <p className="text-sm text-foreground">{selectedConversationData.lastMessage.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(selectedConversationData.lastMessage.createdAt!).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Mock response for demonstration */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-primary rounded-lg p-3 max-w-xs lg:max-w-md">
                      <p className="text-sm text-primary-foreground">
                        Thanks for your message! I'll get back to you soon.
                      </p>
                      <p className="text-xs text-primary-foreground/70 mt-1">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs font-medium">ME</span>
                    </div>
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                      data-testid="input-message-text"
                    />
                    <Button 
                      type="submit" 
                      className="gradient-bg text-primary-foreground mobile-touch"
                      disabled={!messageText.trim()}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Select a conversation to start messaging</p>
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
