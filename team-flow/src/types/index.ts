export interface User {
  id: string;
  name: string;
  email: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: User | null;
  dueDate: string | null;
  priority: Priority;
  comments?: Comment[];
}

export interface Board {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  members: User[];
  boards: Board[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'task_assigned' | 'comment_added' | 'task_moved' | 'board_created';
  message: string;
  read: boolean;
  timestamp: string;
}
