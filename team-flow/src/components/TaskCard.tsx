import { Task, User } from '@/types';
import { Draggable } from '@hello-pangea/dnd';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MessageSquare } from 'lucide-react';
import { getInitials, getAvatarColor, formatDate } from '@/lib/utils';
import { Priority } from '@/types';

const priorityStyles: Record<Priority, string> = {
  low: 'bg-priority-low/15 text-priority-low border-priority-low/30',
  medium: 'bg-priority-medium/15 text-priority-medium border-priority-medium/30',
  high: 'bg-priority-high/15 text-priority-high border-priority-high/30',
  urgent: 'bg-priority-urgent/15 text-priority-urgent border-priority-urgent/30',
};

interface Props {
  task: Task;
  index: number;
  onClick: () => void;
}

export default function TaskCard({ task, index, onClick }: Props) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-card rounded-lg border border-border/50 p-3 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-150 ${
            snapshot.isDragging ? 'shadow-xl rotate-2 scale-105' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium leading-snug flex-1">{task.title}</h4>
            <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 h-5 font-medium capitalize ${priorityStyles[task.priority]}`}>
              {task.priority}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback style={{ backgroundColor: getAvatarColor(task.assignee.name) }} className="text-[9px] font-medium text-primary-foreground">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              {task.dueDate && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            {task.comments?.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {task.comments.length}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
