import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import KanbanBoard from '@/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Plus, Check, X } from 'lucide-react';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, moveTask, addBoard } = useApp();
  const project = projects.find(p => p.id === id);

  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <h2 className="text-xl font-semibold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">This project doesn't exist or has been deleted.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    moveTask(project.id, source.droppableId, destination.droppableId, source.index, destination.index);
  };

  const handleAddBoard = () => {
    if (!newBoardTitle.trim()) return;
    addBoard(project.id, newBoardTitle.trim());
    setNewBoardTitle('');
    setIsAddingBoard(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0 self-start">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{project.name}</h1>
          <p className="text-sm text-muted-foreground truncate">{project.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex -space-x-2">
            {project.members.map(m => (
              <Tooltip key={m.id}>
                <TooltipTrigger>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback style={{ backgroundColor: getAvatarColor(m.name) }} className="text-[10px] font-medium text-primary-foreground">
                      {getInitials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{m.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ minHeight: 'calc(100vh - 14rem)' }}>
          {project.boards.map(board => (
            <KanbanBoard
              key={board.id}
              board={board}
              projectId={project.id}
              members={project.members}
              boards={project.boards}
            />
          ))}

          {/* Add Board */}
          <div className="w-72 shrink-0">
            {isAddingBoard ? (
              <div className="bg-kanban rounded-xl p-3 space-y-2">
                <Input
                  value={newBoardTitle}
                  onChange={e => setNewBoardTitle(e.target.value)}
                  placeholder="Board title..."
                  className="h-9"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddBoard();
                    if (e.key === 'Escape') { setIsAddingBoard(false); setNewBoardTitle(''); }
                  }}
                />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleAddBoard}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setIsAddingBoard(false); setNewBoardTitle(''); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-12 border-dashed text-muted-foreground hover:text-foreground"
                onClick={() => setIsAddingBoard(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Board
              </Button>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
