import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, Project, Task, AppNotification, Priority } from '@/types';
import { mockUsers } from '@/data/mockData';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { authAPI, projectsAPI, boardsAPI, tasksAPI, commentsAPI, notificationsAPI } from '@/lib/api';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  projects: Project[];
  loading: boolean;
  createProject: (name: string, description: string, memberIds: string[]) => Promise<void>;
  addBoard: (projectId: string, title: string) => Promise<void>;
  updateBoardTitle: (projectId: string, boardId: string, title: string) => void;
  deleteBoard: (projectId: string, boardId: string) => Promise<void>;
  addTask: (projectId: string, boardId: string, title: string) => Promise<void>;
  updateTask: (projectId: string, boardId: string, taskId: string, updates: Partial<Task>, newBoardId?: string) => Promise<void>;
  deleteTask: (projectId: string, boardId: string, taskId: string) => Promise<void>;
  moveTask: (projectId: string, sourceBoardId: string, destBoardId: string, sourceIndex: number, destIndex: number) => Promise<void>;
  addComment: (projectId: string, boardId: string, taskId: string, text: string) => Promise<void>;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  allUsers: User[];
  isDark: boolean;
  toggleTheme: () => void;
  refreshProjects: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isDark, setIsDark] = useState(() => {
    document.documentElement.classList.add('dark');
    return true;
  });

  const isAuthenticated = user !== null;

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      if (response.success) {
        // Transform backend data to frontend format
        const transformedProjects = response.data.map((p: any) => ({
          id: p._id,
          name: p.name,
          description: p.description || '',
          members: p.members?.map((m: any) => ({
            id: m.user?._id || m.user,
            name: m.user?.name || 'Unknown',
            email: m.user?.email || '',
          })) || [],
          createdAt: new Date(p.createdAt).toISOString().split('T')[0],
          boards: p.boards?.map((b: any) => ({
            id: b._id,
            title: b.name,
            tasks: (b.tasks || []).map((t: any) => ({
              id: t._id,
              title: t.title || '',
              description: t.description || '',
              priority: t.priority || 'medium',
              dueDate: t.dueDate || null,
              assignee: t.assignedTo?.[0] ? {
                id: t.assignedTo[0]._id || t.assignedTo[0],
                name: t.assignedTo[0].name || 'Unknown',
                email: t.assignedTo[0].email || '',
              } : null,
              comments: t.comments || [],
            })),
          })) || [],
        }));
        setProjects(transformedProjects);
      }
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationsAPI.getAll();
      if (response.success) {
        const transformed = response.data.map((n: any) => ({
          id: n._id,
          type: n.type,
          message: n.message,
          read: n.read,
          timestamp: n.createdAt,
        }));
        setNotifications(transformed);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Load projects on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshProjects();
      loadNotifications();
    }
  }, [isAuthenticated]);

  const pushNotification = useCallback((type: AppNotification['type'], message: string) => {
    setNotifications(prev => [{
      id: generateId(), type, message, read: false, timestamp: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        const userData = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
        };
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password);
      if (response.success) {
        const userData = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
        };
        setUser(userData);
        toast.success('Account created successfully!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setProjects([]);
    setNotifications([]);
    toast.info('Logged out successfully');
  }, []);

  const createProject = useCallback(async (name: string, description: string, memberEmails: string[]) => {
    try {
      const response = await projectsAPI.create({ name, description });
      if (response.success) {
        toast.success(`Project "${name}" created!`);
        await refreshProjects();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  }, [refreshProjects]);

  const addBoard = useCallback(async (projectId: string, title: string) => {
    try {
      const response = await boardsAPI.create({ name: title, project: projectId });
      if (response.success) {
        pushNotification('board_created', `Board "${title}" was created`);
        toast.success(`Board "${title}" added!`);
        await refreshProjects();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create board');
    }
  }, [pushNotification, refreshProjects]);

  const updateBoardTitle = useCallback((projectId: string, boardId: string, title: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, boards: p.boards.map(b => b.id === boardId ? { ...b, title } : b) } : p
    ));
  }, []);

  const deleteBoard = useCallback(async (projectId: string, boardId: string) => {
    try {
      const response = await boardsAPI.delete(boardId);
      if (response.success) {
        toast.success('Board deleted');
        await refreshProjects();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete board');
    }
  }, [refreshProjects]);

  const addTask = useCallback(async (projectId: string, boardId: string, title: string) => {
    try {
      const response = await tasksAPI.create({
        title,
        project: projectId,
        board: boardId,
        description: '',
        priority: 'medium',
      });
      if (response.success) {
        // Optionally, you could optimistically add the new task to the board here
        // but for now, just ensure refreshProjects will always map id correctly
        if (response.data && response.data._id) {
          response.data.id = response.data._id;
        }
        pushNotification('task_assigned', `Task "${title}" was created`);
        toast.success(`Task created!`);
        await refreshProjects();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  }, [pushNotification, refreshProjects]);

  const updateTask = useCallback(async (projectId: string, boardId: string, taskId: string, updates: Partial<Task>, newBoardId?: string) => {
    try {
      console.log('updateTask called with:', { projectId, boardId, taskId, updates, newBoardId });
      
      if (!taskId) {
        toast.error('Task ID is missing - cannot update task');
        return;
      }
      
      if (newBoardId && newBoardId !== boardId) {
        await tasksAPI.move(taskId, newBoardId, 0);
        pushNotification('task_moved', `Task moved`);
      } else {
        // Transform frontend Task format to backend format
        const backendUpdates: any = { ...updates };
        if ('assignee' in backendUpdates) {
          backendUpdates.assignedTo = backendUpdates.assignee ? [backendUpdates.assignee.id] : [];
          delete backendUpdates.assignee;
        }
        delete backendUpdates.id;
        delete backendUpdates.comments;
        
        console.log('Calling tasksAPI.update with taskId:', taskId, 'updates:', backendUpdates);
        await tasksAPI.update(taskId, backendUpdates);
      }
      toast.success('Task updated!');
      await refreshProjects();
    } catch (error: any) {
      console.error('updateTask error:', error);
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  }, [pushNotification, refreshProjects]);

  const deleteTask = useCallback(async (projectId: string, boardId: string, taskId: string) => {
    try {
      const response = await tasksAPI.delete(taskId);
      if (response.success) {
        toast.success('Task deleted');
        await refreshProjects();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  }, [refreshProjects]);

  const moveTask = useCallback(async (projectId: string, sourceBoardId: string, destBoardId: string, sourceIndex: number, destIndex: number) => {
    // Optimistic update
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newBoards = p.boards.map(b => ({ ...b, tasks: [...b.tasks] }));
      const sourceBoard = newBoards.find(b => b.id === sourceBoardId)!;
      const [movedTask] = sourceBoard.tasks.splice(sourceIndex, 1);
      console.log('Moving task:', movedTask);
      if (sourceBoardId === destBoardId) {
        sourceBoard.tasks.splice(destIndex, 0, movedTask);
      } else {
        const destBoard = newBoards.find(b => b.id === destBoardId)!;
        destBoard.tasks.splice(destIndex, 0, movedTask);
        pushNotification('task_moved', `"${movedTask.title}" moved to ${destBoard.title}`);
        // Call API to move task
        if (movedTask && movedTask.id) {
          tasksAPI.move(movedTask.id, destBoardId, destIndex).catch(error => {
            toast.error('Failed to move task');
            refreshProjects();
          });
        } else {
          console.error('moveTask: movedTask or movedTask.id is undefined!', movedTask);
        }
      }
      return { ...p, boards: newBoards };
    }));
  }, [pushNotification, refreshProjects]);

  const addComment = useCallback(async (projectId: string, boardId: string, taskId: string, text: string) => {
    if (!user) return;
    if (!taskId) {
      toast.error('Cannot add comment: Task ID is missing');
      return;
    }
    try {
      const response = await commentsAPI.create({ content: text, task: taskId });
      if (response.success) {
        pushNotification('comment_added', `${user.name} commented on a task`);
        toast.success('Comment added!');
        await refreshProjects();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  }, [user, pushNotification, refreshProjects]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, login, register, logout,
      projects, loading, createProject, refreshProjects,
      addBoard, updateBoardTitle, deleteBoard,
      addTask, updateTask, deleteTask, moveTask,
      addComment,
      notifications, markNotificationRead, markAllNotificationsRead,
      allUsers: mockUsers, isDark, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
