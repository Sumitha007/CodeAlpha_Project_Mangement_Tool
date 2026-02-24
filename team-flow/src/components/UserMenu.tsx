import { useApp } from '@/context/AppContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function UserMenu() {
  const { user, logout, isDark, toggleTheme } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback style={{ backgroundColor: getAvatarColor(user.name) }} className="text-sm font-medium text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.info('Profile settings coming soon!')}>
          <User className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info('Settings coming soon!')}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme}>
          {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
