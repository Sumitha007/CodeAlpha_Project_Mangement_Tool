import { User, Project, AppNotification } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com' },
  { id: '3', name: 'Mike Peters', email: 'mike@example.com' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com' },
  { id: '5', name: 'James Wilson', email: 'james@example.com' },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with a modern design system and improved UX.',
    members: [mockUsers[0], mockUsers[1], mockUsers[2]],
    createdAt: '2025-01-15',
    boards: [
      {
        id: 'b1',
        title: 'To Do',
        tasks: [
          {
            id: 't1',
            title: 'Design homepage mockup',
            description: 'Create a modern homepage design with hero section, features grid, and testimonials carousel.',
            assignee: mockUsers[1],
            dueDate: '2025-02-28',
            priority: 'high',
            comments: [
              { id: 'c1', user: mockUsers[0], text: "Let's use a minimalist approach with bold typography.", timestamp: '2025-02-20T10:30:00' },
              { id: 'c2', user: mockUsers[1], text: 'I agree! I\'ll prepare some concepts by Friday.', timestamp: '2025-02-20T11:15:00' },
            ],
          },
          {
            id: 't2',
            title: 'Set up CI/CD pipeline',
            description: 'Configure GitHub Actions for automated testing and deployment to staging.',
            assignee: mockUsers[2],
            dueDate: '2025-03-05',
            priority: 'medium',
            comments: [],
          },
        ],
      },
      {
        id: 'b2',
        title: 'In Progress',
        tasks: [
          {
            id: 't3',
            title: 'Implement authentication',
            description: 'Build login, registration, and password reset flows with proper validation.',
            assignee: mockUsers[0],
            dueDate: '2025-02-25',
            priority: 'urgent',
            comments: [
              { id: 'c3', user: mockUsers[2], text: 'Are we using OAuth or custom auth?', timestamp: '2025-02-21T09:00:00' },
            ],
          },
        ],
      },
      {
        id: 'b3',
        title: 'Done',
        tasks: [
          {
            id: 't4',
            title: 'Project setup & tooling',
            description: 'Initialize project with React, TypeScript, Tailwind, and configure ESLint/Prettier.',
            assignee: mockUsers[0],
            dueDate: '2025-02-10',
            priority: 'low',
            comments: [],
          },
        ],
      },
    ],
  },
  {
    id: 'p2',
    name: 'Mobile App MVP',
    description: 'Cross-platform mobile application for customer engagement and loyalty programs.',
    members: [mockUsers[0], mockUsers[3], mockUsers[4]],
    createdAt: '2025-02-01',
    boards: [
      { id: 'b4', title: 'Backlog', tasks: [] },
      { id: 'b5', title: 'Sprint', tasks: [
        {
          id: 't5',
          title: 'User onboarding flow',
          description: 'Design and implement the first-time user experience with guided walkthrough.',
          assignee: mockUsers[3],
          dueDate: '2025-03-10',
          priority: 'high',
          comments: [],
        },
      ] },
      { id: 'b6', title: 'Review', tasks: [] },
      { id: 'b7', title: 'Done', tasks: [] },
    ],
  },
  {
    id: 'p3',
    name: 'API Platform',
    description: 'Internal API gateway and developer documentation portal.',
    members: [mockUsers[0], mockUsers[1], mockUsers[4]],
    createdAt: '2025-02-10',
    boards: [
      { id: 'b8', title: 'To Do', tasks: [] },
      { id: 'b9', title: 'In Progress', tasks: [] },
      { id: 'b10', title: 'Done', tasks: [] },
    ],
  },
];

export const mockNotifications: AppNotification[] = [
  { id: 'n1', type: 'task_assigned', message: 'You were assigned to "Design homepage mockup"', read: false, timestamp: '2025-02-22T14:00:00' },
  { id: 'n2', type: 'comment_added', message: 'Sarah commented on "Implement authentication"', read: false, timestamp: '2025-02-22T12:30:00' },
  { id: 'n3', type: 'task_moved', message: '"Project setup" was moved to Done', read: true, timestamp: '2025-02-21T09:00:00' },
  { id: 'n4', type: 'board_created', message: 'New board "Review" was created', read: true, timestamp: '2025-02-20T16:00:00' },
];
