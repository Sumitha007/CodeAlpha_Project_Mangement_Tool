const Task = require('../models/Task');
const Board = require('../models/Board');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// @desc    Get all tasks for a project or board
// @route   GET /api/tasks?project=projectId&board=boardId
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, board } = req.query;
    const query = {};

    if (project) query.project = project;
    if (board) query.board = board;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments')
      .sort('position');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name email avatar' }
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const task = await Task.create(req.body);

    // Add task to board
    await Board.findByIdAndUpdate(task.board, {
      $push: { tasks: task._id }
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Create notifications for assigned users
    if (task.assignedTo && task.assignedTo.length > 0) {
      const notifications = task.assignedTo.map(user => ({
        recipient: user._id,
        sender: req.user.id,
        type: 'task_assigned',
        title: 'New task assigned',
        message: `You have been assigned to task: ${task.title}`,
        link: `/projects/${task.project}/tasks/${task._id}`,
        project: task.project,
        task: task._id
      }));

      await Notification.insertMany(notifications);

      // Emit socket events for notifications
      const io = req.app.get('io');
      task.assignedTo.forEach(user => {
        io.to(`user_${user._id}`).emit('notification', {
          type: 'task_assigned',
          task
        });
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('task_created', task);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    console.log('updateTask - req.params.id:', req.params.id);
    console.log('updateTask - req.body:', req.body);
    
    let task = await Task.findById(req.params.id);
    console.log('updateTask - found task:', task);

    if (!task) {
      console.log('updateTask - Task not found in database');
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const oldAssignees = task.assignedTo.map(id => id.toString());
    const newAssignees = req.body.assignedTo || oldAssignees;

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate({
      path: 'comments',
      populate: { path: 'user', select: 'name email avatar' }
    });

    // Create notifications for newly assigned users
    const addedAssignees = newAssignees.filter(id => !oldAssignees.includes(id.toString()));
    if (addedAssignees.length > 0) {
      const notifications = addedAssignees.map(userId => ({
        recipient: userId,
        sender: req.user.id,
        type: 'task_assigned',
        title: 'Task assigned',
        message: `You have been assigned to task: ${task.title}`,
        link: `/projects/${task.project}/tasks/${task._id}`,
        project: task.project,
        task: task._id
      }));

      await Notification.insertMany(notifications);

      // Emit socket events
      const io = req.app.get('io');
      addedAssignees.forEach(userId => {
        io.to(`user_${userId}`).emit('notification', {
          type: 'task_assigned',
          task
        });
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('task_updated', task);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Remove task from board
    await Board.findByIdAndUpdate(task.board, {
      $pull: { tasks: task._id }
    });

    await task.deleteOne();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('task_deleted', task._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move task to different board
// @route   PUT /api/tasks/:id/move
// @access  Private
exports.moveTask = async (req, res, next) => {
  try {
    const { boardId, position } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const oldBoardId = task.board;

    // Remove task from old board
    await Board.findByIdAndUpdate(oldBoardId, {
      $pull: { tasks: task._id }
    });

    // Add task to new board
    await Board.findByIdAndUpdate(boardId, {
      $push: { tasks: task._id }
    });

    // Update task
    task.board = boardId;
    task.position = position || 0;
    await task.save();

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Create notification for task movement
    const board = await Board.findById(boardId);
    if (task.assignedTo && task.assignedTo.length > 0) {
      const notifications = task.assignedTo
        .filter(user => user._id.toString() !== req.user.id)
        .map(user => ({
          recipient: user._id,
          sender: req.user.id,
          type: 'task_moved',
          title: 'Task moved',
          message: `Task "${task.title}" was moved to ${board.name}`,
          link: `/projects/${task.project}/tasks/${task._id}`,
          project: task.project,
          task: task._id
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);

        // Emit socket events
        const io = req.app.get('io');
        task.assignedTo.forEach(user => {
          if (user._id.toString() !== req.user.id) {
            io.to(`user_${user._id}`).emit('notification', {
              type: 'task_moved',
              task,
              board: board.name
            });
          }
        });
      }
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('task_moved', {
      task,
      oldBoardId,
      newBoardId: boardId
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};
