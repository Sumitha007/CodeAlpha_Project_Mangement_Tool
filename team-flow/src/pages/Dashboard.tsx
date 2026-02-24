import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FolderKanban } from 'lucide-react';

export default function Dashboard() {
  const { projects, user } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    let result = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filter === 'mine' && user) {
      result = result.filter(p => p.members.some(m => m.id === user.id));
    }
    return result;
  }, [projects, search, filter, user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all your team projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="mine">My Projects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
          title={search ? 'No projects found' : 'No projects yet'}
          description={search ? 'Try adjusting your search or filters' : 'Create your first project to get started'}
          action={!search ? <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Create Project</Button> : undefined}
        />
      )}

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
