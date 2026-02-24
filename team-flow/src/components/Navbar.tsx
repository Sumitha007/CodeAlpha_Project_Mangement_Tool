import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import UserMenu from '@/components/UserMenu';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">TaskFlow</span>
        </Link>

        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border"
              readOnly
              onClick={() => {
                if (location.pathname !== '/dashboard') {
                  window.location.href = '/dashboard';
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <NotificationsDropdown />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
