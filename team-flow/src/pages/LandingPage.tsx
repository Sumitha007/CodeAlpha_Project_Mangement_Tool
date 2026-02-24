import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, CheckCircle2, Users, Zap, ArrowRight, KanbanSquare, MessageSquare, Bell } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const features = [
  {
    icon: <KanbanSquare className="h-6 w-6" />,
    title: 'Kanban Boards',
    description: 'Organize work visually with drag-and-drop boards, columns, and cards.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Team Collaboration',
    description: 'Invite members, assign tasks, and keep everyone aligned in real time.',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Comments & Updates',
    description: 'Discuss tasks directly with threaded comments and instant notifications.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Real-Time Updates',
    description: 'See changes instantly as your team creates, moves, and completes tasks.',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Smart Notifications',
    description: 'Stay informed with task assignments, comments, and status change alerts.',
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: 'Priority Tracking',
    description: 'Set priorities, due dates, and statuses to keep projects on track.',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        <div className="relative max-w-4xl mx-auto text-center px-4 py-24 md:py-36">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-muted/50 text-sm text-muted-foreground mb-6 animate-fade-in">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Project management, reimagined
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 animate-fade-in">
            Manage projects with
            <span className="text-primary"> clarity and speed</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
            TaskFlow brings your team together with intuitive Kanban boards, real-time collaboration, and powerful task management — all in one beautiful workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
            <Link to="/register">
              <Button size="lg" className="text-base px-8">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything you need to ship faster</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Powerful features designed for modern teams who want to stay organized and move fast.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-20">
        <div className="relative rounded-2xl border border-border/50 bg-card p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-3">Ready to streamline your workflow?</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Join thousands of teams using TaskFlow to deliver projects on time.
            </p>
            <Link to="/register">
              <Button size="lg" className="text-base px-8">
                Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">TaskFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 TaskFlow. Built for modern teams.</p>
        </div>
      </footer>
    </div>
  );
}
