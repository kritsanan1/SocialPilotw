import { useLocation } from "wouter";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface BottomNavigationProps {
  navigation: NavigationItem[];
  currentPath: string;
}

export default function BottomNavigation({ navigation, currentPath }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 safe-area-inset-bottom">
      <div className="grid grid-cols-6 gap-0">
        {navigation.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <a
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center py-2 px-1 mobile-touch transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                {item.icon === 'chart-line' && <div className="w-5 h-3 bg-current rounded-sm"></div>}
                {item.icon === 'calendar' && <div className="w-5 h-5 bg-current rounded"></div>}
                {item.icon === 'message-circle' && <div className="w-5 h-5 bg-current rounded-full"></div>}
                {item.icon === 'message-square' && <div className="w-5 h-5 bg-current rounded"></div>}
                {item.icon === 'upload' && <div className="w-5 h-4 bg-current rounded-t"></div>}
                {item.icon === 'link' && <div className="w-5 h-5 bg-current rounded"></div>}
              </div>
              <span className="text-xs font-medium leading-none">
                {item.label.split(' ')[0]}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
