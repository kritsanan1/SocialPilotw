import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Share, X } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  currentPath: string;
}

export default function MobileSidebar({ isOpen, onClose, navigation, currentPath }: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-80 bg-sidebar border-sidebar-border">
        <SheetHeader className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Share className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-sidebar-foreground">SocialSync</SheetTitle>
                <p className="text-sm text-muted-foreground">AI Social Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="mobile-touch"
              data-testid="button-close-sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.id}>
                <a
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 p-4 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors mobile-touch ${
                    currentPath === item.path ? 'bg-sidebar-accent' : ''
                  }`}
                  data-testid={`link-${item.id}-mobile`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon === 'chart-line' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'calendar' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'message-circle' && <div className="w-4 h-4 bg-current rounded-full"></div>}
                    {item.icon === 'message-square' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'upload' && <div className="w-4 h-4 bg-current rounded"></div>}
                    {item.icon === 'link' && <div className="w-4 h-4 bg-current rounded"></div>}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-chart-5 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">JD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sidebar-foreground">John Doe</p>
              <p className="text-sm text-muted-foreground">Pro Plan</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-sidebar-foreground">
              <div className="w-4 h-4 bg-current rounded"></div>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
