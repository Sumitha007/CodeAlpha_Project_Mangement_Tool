const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Middleware for socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user connection
    connectedUsers.set(socket.userId, socket.id);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Send connection success
    socket.emit('connected', {
      message: 'Connected to socket server',
      userId: socket.userId
    });

    // Join project rooms
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`User ${socket.userId} joined project ${projectId}`);
      
      // Notify other members in the project
      socket.to(`project_${projectId}`).emit('user_joined_project', {
        userId: socket.userId,
        projectId
      });
    });

    // Leave project room
    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
      console.log(`User ${socket.userId} left project ${projectId}`);
      
      // Notify other members
      socket.to(`project_${projectId}`).emit('user_left_project', {
        userId: socket.userId,
        projectId
      });
    });

    // Handle typing indicator
    socket.on('typing_start', ({ projectId, taskId, userName }) => {
      socket.to(`project_${projectId}`).emit('user_typing', {
        userId: socket.userId,
        taskId,
        userName
      });
    });

    socket.on('typing_stop', ({ projectId, taskId }) => {
      socket.to(`project_${projectId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        taskId
      });
    });

    // Handle real-time task updates
    socket.on('task_update_request', (data) => {
      socket.to(`project_${data.projectId}`).emit('task_update_received', data);
    });

    // Handle board updates
    socket.on('board_update_request', (data) => {
      socket.to(`project_${data.projectId}`).emit('board_update_received', data);
    });

    // Handle user presence
    socket.on('user_active', ({ projectId }) => {
      socket.to(`project_${projectId}`).emit('user_status_changed', {
        userId: socket.userId,
        status: 'active'
      });
    });

    socket.on('user_away', ({ projectId }) => {
      socket.to(`project_${projectId}`).emit('user_status_changed', {
        userId: socket.userId,
        status: 'away'
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);

      // Notify all rooms this user was in
      io.emit('user_disconnected', {
        userId: socket.userId
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An error occurred' });
    });
  });

  // Helper function to check if user is online
  io.isUserOnline = (userId) => {
    return connectedUsers.has(userId);
  };

  // Helper function to get user's socket
  io.getUserSocket = (userId) => {
    const socketId = connectedUsers.get(userId);
    return socketId ? io.sockets.sockets.get(socketId) : null;
  };

  return io;
};
