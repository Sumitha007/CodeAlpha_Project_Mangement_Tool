import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, CalendarDays, Users } from 'lucide-react';
import { getInitials, getAvatarColor, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();
  const taskCount = project.boards.reduce((sum, b) => sum + b.tasks.length, 0);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20 cursor-pointer"
      onClick={() => navigate(`/project/${project.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold leading-tight">{project.name}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.members.length}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(project.createdAt)}
            </span>
            <span>{taskCount} tasks</span>
          </div>
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map(m => (
              <Avatar key={m.id} className="h-7 w-7 border-2 border-card">
                <AvatarFallback style={{ backgroundColor: getAvatarColor(m.name) }} className="text-[10px] font-medium text-primary-foreground">
                  {getInitials(m.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <Avatar className="h-7 w-7 border-2 border-card">
                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground font-medium">
                  +{project.members.length - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
