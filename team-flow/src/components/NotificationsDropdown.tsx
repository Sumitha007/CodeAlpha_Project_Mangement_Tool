import { useApp } from '@/context/AppContext';
import { Bell, CheckCheck, MessageSquare, ArrowRightLeft, LayoutGrid } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimestamp } from '@/lib/utils';
import { AppNotification } from '@/types';

const iconMap: Record<AppNotification['type'], React.ReactNode> = {
  task_assigned: <LayoutGrid className="h-4 w-4 text-primary" />,
  comment_added: <MessageSquare className="h-4 w-4 text-success" />,
  task_moved: <ArrowRightLeft className="h-4 w-4 text-warning" />,
  board_created: <LayoutGrid className="h-4 w-4 text-primary" />,
};

export default function NotificationsDropdown() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllNotificationsRead}>
              <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className="mt-0.5 shrink-0">{iconMap[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.read ? 'font-medium' : 'text-muted-foreground'}`}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(n.timestamp)}</p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
