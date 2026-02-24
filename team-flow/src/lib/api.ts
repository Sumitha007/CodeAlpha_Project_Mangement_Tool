import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const { data } = await api.get('/projects');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  create: async (projectData: { name: string; description: string; color?: string }) => {
    const { data } = await api.post('/projects', projectData);
    return data;
  },

  update: async (id: string, projectData: any) => {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },

  addMember: async (projectId: string, email: string, role: string = 'member') => {
    const { data } = await api.post(`/projects/${projectId}/members`, { email, role });
    return data;
  },

  removeMember: async (projectId: string, userId: string) => {
    const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
    return data;
  },
};

// Boards API
export const boardsAPI = {
  getAll: async (projectId: string) => {
    const { data } = await api.get(`/boards?project=${projectId}`);
    return data;
  },

  create: async (boardData: { name: string; project: string; position?: number; color?: string }) => {
    const { data } = await api.post('/boards', boardData);
    return data;
  },

  update: async (id: string, boardData: any) => {
    const { data } = await api.put(`/boards/${id}`, boardData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/boards/${id}`);
    return data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (projectId?: string, boardId?: string) => {
    let url = '/tasks?';
    if (projectId) url += `project=${projectId}`;
    if (boardId) url += `&board=${boardId}`;
    const { data } = await api.get(url);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  create: async (taskData: any) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },

  update: async (id: string, taskData: any) => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },

  move: async (id: string, boardId: string, position: number) => {
    const { data } = await api.put(`/tasks/${id}/move`, { boardId, position });
    return data;
  },
};

// Comments API
export const commentsAPI = {
  getAll: async (taskId: string) => {
    const { data } = await api.get(`/comments?task=${taskId}`);
    return data;
  },

  create: async (commentData: { content: string; task: string; mentions?: string[] }) => {
    const { data } = await api.post('/comments', commentData);
    return data;
  },

  update: async (id: string, content: string) => {
    const { data } = await api.put(`/comments/${id}`, { content });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/comments/${id}`);
    return data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (read?: boolean) => {
    let url = '/notifications';
    if (read !== undefined) url += `?read=${read}`;
    const { data } = await api.get(url);
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  clearRead: async () => {
    const { data } = await api.delete('/notifications/clear');
    return data;
  },
};

// Invitations API
export const invitationsAPI = {
  send: async (invitationData: { email: string; projectId: string; role?: string }) => {
    const { data } = await api.post('/invitations', invitationData);
    return data;
  },

  getByProject: async (projectId: string) => {
    const { data } = await api.get(`/invitations?project=${projectId}`);
    return data;
  },

  getByToken: async (token: string) => {
    const { data } = await api.get(`/invitations/token/${token}`);
    return data;
  },

  accept: async (token: string) => {
    const { data } = await api.post(`/invitations/${token}/accept`);
    return data;
  },

  decline: async (token: string) => {
    const { data } = await api.post(`/invitations/${token}/decline`);
    return data;
  },

  cancel: async (id: string) => {
    const { data } = await api.delete(`/invitations/${id}`);
    return data;
  },
};

export default api;
