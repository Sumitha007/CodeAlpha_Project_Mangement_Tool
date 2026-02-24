# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "",
    "role": "user",
    "token": "jwt_token"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
```
🔒 Protected Route

### Update Profile
```http
PUT /auth/updateprofile
```
🔒 Protected Route

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Update Password
```http
PUT /auth/updatepassword
```
🔒 Protected Route

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Project Endpoints

### Get All Projects
```http
GET /projects
```
🔒 Protected Route

Returns all projects where user is owner or member.

### Get Single Project
```http
GET /projects/:id
```
🔒 Protected Route

### Create Project
```http
POST /projects
```
🔒 Protected Route

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "color": "#3B82F6",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Update Project
```http
PUT /projects/:id
```
🔒 Protected Route (Owner or Admin only)

### Delete Project
```http
DELETE /projects/:id
```
🔒 Protected Route (Owner only)

### Add Member to Project
```http
POST /projects/:id/members
```
🔒 Protected Route (Owner or Admin only)

**Request Body:**
```json
{
  "email": "member@example.com",
  "role": "member"
}
```

Roles: `owner`, `admin`, `member`

### Remove Member from Project
```http
DELETE /projects/:id/members/:userId
```
🔒 Protected Route (Owner or Admin only)

---

## Board Endpoints

### Get All Boards
```http
GET /boards?project=projectId
```
🔒 Protected Route

### Get Single Board
```http
GET /boards/:id
```
🔒 Protected Route

### Create Board
```http
POST /boards
```
🔒 Protected Route

**Request Body:**
```json
{
  "name": "In Progress",
  "project": "project_id",
  "position": 1,
  "color": "#10B981"
}
```

### Update Board
```http
PUT /boards/:id
```
🔒 Protected Route

### Delete Board
```http
DELETE /boards/:id
```
🔒 Protected Route

---

## Task Endpoints

### Get All Tasks
```http
GET /tasks?project=projectId&board=boardId
```
🔒 Protected Route

### Get Single Task
```http
GET /tasks/:id
```
🔒 Protected Route

### Create Task
```http
POST /tasks
```
🔒 Protected Route

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "project": "project_id",
  "board": "board_id",
  "assignedTo": ["user_id_1", "user_id_2"],
  "priority": "high",
  "status": "todo",
  "dueDate": "2024-12-31",
  "tags": ["frontend", "bug"]
}
```

**Priority:** `low`, `medium`, `high`, `urgent`  
**Status:** `todo`, `in-progress`, `review`, `done`

### Update Task
```http
PUT /tasks/:id
```
🔒 Protected Route

### Delete Task
```http
DELETE /tasks/:id
```
🔒 Protected Route

### Move Task Between Boards
```http
PUT /tasks/:id/move
```
🔒 Protected Route

**Request Body:**
```json
{
  "boardId": "new_board_id",
  "position": 0
}
```

---

## Comment Endpoints

### Get All Comments
```http
GET /comments?task=taskId
```
🔒 Protected Route

### Create Comment
```http
POST /comments
```
🔒 Protected Route

**Request Body:**
```json
{
  "content": "This is a comment",
  "task": "task_id",
  "mentions": ["user_id_1", "user_id_2"]
}
```

### Update Comment
```http
PUT /comments/:id
```
🔒 Protected Route (Comment owner only)

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

### Delete Comment
```http
DELETE /comments/:id
```
🔒 Protected Route (Comment owner only)

---

## Notification Endpoints

### Get All Notifications
```http
GET /notifications?read=false
```
🔒 Protected Route

Optional query parameter: `read=true` or `read=false`

### Mark Notification as Read
```http
PUT /notifications/:id/read
```
🔒 Protected Route

### Mark All Notifications as Read
```http
PUT /notifications/read-all
```
🔒 Protected Route

### Delete Notification
```http
DELETE /notifications/:id
```
🔒 Protected Route

### Clear All Read Notifications
```http
DELETE /notifications/clear
```
🔒 Protected Route

---

## Socket.io Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Client -> Server Events

#### Join Project Room
```javascript
socket.emit('join_project', projectId);
```

#### Leave Project Room
```javascript
socket.emit('leave_project', projectId);
```

#### Typing Indicators
```javascript
socket.emit('typing_start', {
  projectId: 'project_id',
  taskId: 'task_id',
  userName: 'John Doe'
});

socket.emit('typing_stop', {
  projectId: 'project_id',
  taskId: 'task_id'
});
```

#### User Status
```javascript
socket.emit('user_active', { projectId: 'project_id' });
socket.emit('user_away', { projectId: 'project_id' });
```

### Server -> Client Events

#### Connection Events
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

#### Project Events
```javascript
socket.on('project_created', (project) => {});
socket.on('project_updated', (project) => {});
socket.on('project_deleted', (projectId) => {});
socket.on('member_added', (data) => {});
socket.on('member_removed', (data) => {});
```

#### Board Events
```javascript
socket.on('board_created', (board) => {});
socket.on('board_updated', (board) => {});
socket.on('board_deleted', (boardId) => {});
```

#### Task Events
```javascript
socket.on('task_created', (task) => {});
socket.on('task_updated', (task) => {});
socket.on('task_deleted', (taskId) => {});
socket.on('task_moved', (data) => {
  // data: { task, oldBoardId, newBoardId }
});
```

#### Comment Events
```javascript
socket.on('comment_added', (data) => {
  // data: { comment, task }
});
socket.on('comment_updated', (comment) => {});
socket.on('comment_deleted', (commentId) => {});
```

#### Notification Events
```javascript
socket.on('notification', (data) => {
  // Real-time notifications
});
```

#### User Events
```javascript
socket.on('user_typing', (data) => {});
socket.on('user_stopped_typing', (data) => {});
socket.on('user_status_changed', (data) => {});
socket.on('user_disconnected', (data) => {});
socket.on('user_joined_project', (data) => {});
socket.on('user_left_project', (data) => {});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Notification Types

- `task_assigned` - User assigned to a task
- `task_updated` - Task was updated
- `task_moved` - Task moved to another board
- `task_completed` - Task marked as complete
- `comment_added` - New comment on task
- `mention` - User mentioned in comment
- `project_invite` - Added to a project
- `due_date_reminder` - Task due date approaching

---

## Tips for Frontend Integration

### 1. Store JWT Token
```javascript
localStorage.setItem('token', response.data.token);
```

### 2. Add Token to Requests
```javascript
const config = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
};
axios.get('/api/projects', config);
```

### 3. Socket.io Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

### 4. Handle Real-time Updates
```javascript
useEffect(() => {
  socket.on('task_created', (task) => {
    // Update state with new task
    setTasks(prev => [...prev, task]);
  });

  return () => socket.off('task_created');
}, []);
```
