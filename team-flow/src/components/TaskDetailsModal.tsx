import { useState, useEffect } from 'react';
import { Task, Board, User, Priority } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { cn, getInitials, getAvatarColor, formatDate } from '@/lib/utils';
import CommentSection from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  boardId: string;
  boards: Board[];
  members: User[];
}

export default function TaskDetailsModal({ open, onClose, task, projectId, boardId, boards, members }: Props) {
  const { updateTask, deleteTask } = useApp();
  const { toast } = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id || 'none');
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate ? new Date(task.dueDate) : undefined);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState(boardId);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setAssigneeId(task.assignee?.id || 'none');
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setPriority(task.priority);
    setStatus(boardId);
  }, [task, boardId]);

  const handleSave = () => {
    console.log('TaskDetailsModal handleSave - task object:', task);
    console.log('TaskDetailsModal handleSave - task.id:', task.id);
    
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Task title is required' });
      return;
    }
    
    if (!task.id) {
      toast({ variant: 'destructive', title: 'Task ID is missing - cannot save changes' });
      return;
    }
    
    const assignee = assigneeId === 'none' ? null : members.find(m => m.id === assigneeId) || null;
    updateTask(projectId, boardId, task.id, {
      title: title.trim(),
      description: description.trim(),
      assignee,
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
      priority,
    }, status !== boardId ? status : undefined);
    onClose();
  };

  const handleDelete = () => {
    deleteTask(projectId, boardId, task.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Task Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-lg font-semibold border-transparent hover:border-border focus:border-border px-0 h-auto"
            placeholder="Task title"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback style={{ backgroundColor: getAvatarColor(m.name) }} className="text-[8px] text-primary-foreground">
                            {getInitials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? formatDate(dueDate.toISOString()) : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boards.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} className="flex-1">Save Changes</Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {task.id && (
            <CommentSection
              comments={task.comments || []}
              projectId={projectId}
              boardId={status !== boardId ? status : boardId}
              taskId={task.id}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
