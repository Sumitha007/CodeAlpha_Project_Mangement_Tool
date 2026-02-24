import { useState } from 'react';
import { Board, Task, User } from '@/types';
import { useApp } from '@/context/AppContext';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '@/components/TaskCard';
import TaskDetailsModal from '@/components/TaskDetailsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Plus, Trash2, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Props {
  board: Board;
  projectId: string;
  members: User[];
  boards: Board[];
}

export default function KanbanBoard({ board, projectId, members, boards }: Props) {
  const { addTask, updateBoardTitle, deleteBoard } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTitleSave = () => {
    if (title.trim()) {
      updateBoardTitle(projectId, board.id, title.trim());
    } else {
      setTitle(board.title);
    }
    setIsEditing(false);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(projectId, board.id, newTaskTitle.trim());
    setNewTaskTitle('');
    setIsAdding(false);
  };

  return (
    <>
      <div className="w-72 shrink-0 flex flex-col bg-kanban rounded-xl max-h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 pb-2">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                className="h-7 text-sm font-semibold"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleTitleSave}>
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3
                className="text-sm font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {board.title}
              </h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0">
                {board.tasks.length}
              </span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteBoard(projectId, board.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tasks */}
        <Droppable droppableId={board.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto p-2 pt-0 space-y-2 scrollbar-thin transition-colors rounded-lg mx-1 min-h-[60px] ${
                snapshot.isDraggingOver ? 'bg-primary/5' : ''
              }`}
            >
              {board.tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} onClick={() => setSelectedTask(task)} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add Task */}
        <div className="p-2 pt-0">
          {isAdding ? (
            <div className="bg-card rounded-lg border border-border p-2 space-y-2">
              <Input
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="h-8 text-sm"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddTask();
                  if (e.key === 'Escape') { setIsAdding(false); setNewTaskTitle(''); }
                }}
              />
              <div className="flex items-center gap-1">
                <Button size="sm" className="h-7 text-xs" onClick={handleAddTask}>Add</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setIsAdding(false); setNewTaskTitle(''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" className="w-full justify-start text-muted-foreground h-8 text-sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add task
            </Button>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={board.tasks.find(t => t.id === selectedTask.id) || selectedTask}
          projectId={projectId}
          boardId={board.id}
          boards={boards}
          members={members}
        />
      )}
    </>
  );
}
