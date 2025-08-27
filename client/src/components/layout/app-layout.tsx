import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/mobile-sidebar";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Share } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { id: 'dashboard', label: 'Social Dashboard', icon: 'chart-line', path: '/dashboard' },
  { id: 'calendar', label: 'Content Calendar', icon: 'calendar', path: '/calendar' },
  { id: 'messages', label: 'Social Messages', icon: 'message-circle', path: '/messages' },
  { id: 'comments', label: 'Social Comments', icon: 'message-square', path: '/comments' },
  { id: 'upload', label: 'Upload Posts', icon: 'upload', path: '/upload' },
  { id: 'connect', label: 'Connect Socials', icon: 'link', path: '/connect-socials' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const isMobile = useIsMobile();

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const currentPage = navigation.find(nav => nav.path === location) || navigation[0];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="mobile-touch"
            data-testid="button-menu-toggle"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Share className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">SocialSync</h1>
          </div>
          
          <Button variant="ghost" size="icon" className="mobile-touch">
            <Bell className="h-6 w-6" />
          </Button>
        </header>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navigation={navigation}
          currentPath={location}
        />

        {/* Main Content */}
        <main className="pb-20 mobile-nav-safe">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation navigation={navigation} currentPath={location} />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Share className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">SocialSync</h1>
              <p className="text-sm text-muted-foreground">AI Social Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.id}>
                <a
                  href={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors ${
                    location === item.path ? 'bg-sidebar-accent' : ''
                  }`}
                  data-testid={`link-${item.id}`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon === 'chart-line' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'calendar' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'message-circle' && <div className="w-4 h-4 bg-current rounded-full"></div>}
                    {item.icon === 'message-square' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'upload' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'link' && <div className="w-4 h-4 bg-current rounded"></div>}
                  </div>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-chart-5 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-sidebar-foreground">
              <div className="w-4 h-4 bg-current rounded"></div>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
