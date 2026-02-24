# Project Management Tool - Backend Server

A comprehensive backend server for a project management tool with real-time collaboration features using Express.js, MongoDB, and Socket.io.

## 🚀 Features

### 1. Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes middleware
- ✅ Role-based authorization (Owner, Admin, Member)

### 2. Database Models
- ✅ Users - User profiles and authentication
- ✅ Projects - Project management with members and roles
- ✅ Boards - Kanban-style boards (To Do, In Progress, Review, Done)
- ✅ Tasks - Detailed task management with assignments
- ✅ Comments - Task comments with mentions
- ✅ Notifications - Real-time notification system

### 3. REST API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user
- `PUT /updateprofile` - Update user profile
- `PUT /updatepassword` - Update password

#### Projects (`/api/projects`)
- `GET /` - Get all user's projects
- `GET /:id` - Get single project
- `POST /` - Create new project
- `PUT /:id` - Update project
- `DELETE /:id` - Delete project
- `POST /:id/members` - Add member to project
- `DELETE /:id/members/:userId` - Remove member from project

#### Boards (`/api/boards`)
- `GET /?project=projectId` - Get all boards for a project
- `GET /:id` - Get single board
- `POST /` - Create new board
- `PUT /:id` - Update board
- `DELETE /:id` - Delete board

#### Tasks (`/api/tasks`)
- `GET /?project=projectId&board=boardId` - Get tasks
- `GET /:id` - Get single task
- `POST /` - Create new task
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task
- `PUT /:id/move` - Move task between boards

#### Comments (`/api/comments`)
- `GET /?task=taskId` - Get all comments for a task
- `POST /` - Create new comment
- `PUT /:id` - Update comment
- `DELETE /:id` - Delete comment

#### Notifications (`/api/notifications`)
- `GET /` - Get all notifications
- `PUT /read-all` - Mark all as read
- `PUT /:id/read` - Mark notification as read
- `DELETE /:id` - Delete notification
- `DELETE /clear` - Clear all read notifications

### 4. Real-Time Features (Socket.io)
- ✅ Real-time task updates
- ✅ Real-time board changes
- ✅ Live notifications
- ✅ User presence tracking
- ✅ Typing indicators
- ✅ Project room management
- ✅ Live collaboration updates

### 5. Security Features
- ✅ JWT token authentication
- ✅ Password hashing
- ✅ Project membership verification
- ✅ Role-based access control
- ✅ CORS configuration
- ✅ Input validation

### 6. Error Handling
- ✅ Global error handler
- ✅ Mongoose validation errors
- ✅ JWT errors
- ✅ Custom error messages
- ✅ Proper status codes

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   
   Edit the `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/project_management_tool
   JWT_SECRET=your_very_secure_jwt_secret_key_change_in_production
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

3. **Start MongoDB:**
   
   Make sure MongoDB is running on your system.

4. **Run the server:**
   
   Development mode with auto-reload:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

5. **Server should be running on:**
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── projectController.js # Project management
│   ├── boardController.js   # Board operations
│   ├── taskController.js    # Task operations
│   ├── commentController.js # Comment handling
│   └── notificationController.js # Notifications
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── authorization.js    # Role-based authorization
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── User.js            # User schema
│   ├── Project.js         # Project schema
│   ├── Board.js           # Board schema
│   ├── Task.js            # Task schema
│   ├── Comment.js         # Comment schema
│   └── Notification.js    # Notification schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── projectRoutes.js   # Project endpoints
│   ├── boardRoutes.js     # Board endpoints
│   ├── taskRoutes.js      # Task endpoints
│   ├── commentRoutes.js   # Comment endpoints
│   └── notificationRoutes.js # Notification endpoints
├── sockets/
│   └── socketHandler.js   # Socket.io event handlers
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies
└── server.js             # Main server file
```

## 🔌 Socket.io Events

### Client -> Server Events:
- `join_project` - Join a project room
- `leave_project` - Leave a project room
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `task_update_request` - Request task update
- `board_update_request` - Request board update
- `user_active` - User is active
- `user_away` - User is away

### Server -> Client Events:
- `connected` - Connection successful
- `project_created` - New project created
- `project_updated` - Project updated
- `project_deleted` - Project deleted
- `board_created` - New board created
- `board_updated` - Board updated
- `board_deleted` - Board deleted
- `task_created` - New task created
- `task_updated` - Task updated
- `task_deleted` - Task deleted
- `task_moved` - Task moved between boards
- `comment_added` - New comment added
- `comment_updated` - Comment updated
- `comment_deleted` - Comment deleted
- `member_added` - Member added to project
- `member_removed` - Member removed from project
- `notification` - New notification
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `user_status_changed` - User status changed
- `user_disconnected` - User disconnected

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To get a token, register or login:

```javascript
// Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## 📊 API Response Format

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 🧪 Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Frontend application

### Example curl request:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get projects (with token)
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🚧 Common Issues & Solutions

### MongoDB Connection Error:
- Make sure MongoDB is running
- Check the connection string in `.env`
- Verify network connectivity

### JWT Authentication Error:
- Check if token is included in headers
- Verify token hasn't expired
- Ensure JWT_SECRET is set correctly

### Port Already in Use:
- Change the PORT in `.env` file
- Kill the process using the port

## 🔄 Next Steps

1. **Install nodemon for development:**
   ```bash
   npm install --save-dev nodemon
   ```

2. **Connect frontend:**
   - Update frontend API base URL to `http://localhost:5000/api`
   - Add Socket.io client connection

3. **Add additional features:**
   - File upload for attachments
   - Email notifications
   - Due date reminders
   - Activity logs
   - Search functionality

## 📝 License

MIT

## 👥 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using Express.js, MongoDB, and Socket.io**
