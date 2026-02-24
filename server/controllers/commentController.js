const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get all comments for a task
// @route   GET /api/comments?task=taskId
// @access  Private
exports.getComments = async (req, res, next) => {
  try {
    const { task } = req.query;

    if (!task) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task ID'
      });
    }

    const comments = await Comment.find({ task })
      .populate('user', 'name email avatar')
      .populate('mentions', 'name email')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const comment = await Comment.create(req.body);
    
    // Add comment to task
    await Task.findByIdAndUpdate(comment.task, {
      $push: { comments: comment._id }
    });

    await comment.populate('user', 'name email avatar');
    await comment.populate('mentions', 'name email');

    // Get task details for notification
    const task = await Task.findById(comment.task)
      .populate('assignedTo', '_id name email');

    // Create notifications for mentioned users
    if (comment.mentions && comment.mentions.length > 0) {
      const mentionNotifications = comment.mentions
        .filter(user => user._id.toString() !== req.user.id)
        .map(user => ({
          recipient: user._id,
          sender: req.user.id,
          type: 'mention',
          title: 'You were mentioned',
          message: `${req.user.name} mentioned you in a comment`,
          link: `/projects/${task.project}/tasks/${task._id}`,
          project: task.project,
          task: task._id
        }));

      if (mentionNotifications.length > 0) {
        await Notification.insertMany(mentionNotifications);

        // Emit socket events
        const io = req.app.get('io');
        comment.mentions.forEach(user => {
          if (user._id.toString() !== req.user.id) {
            io.to(`user_${user._id}`).emit('notification', {
              type: 'mention',
              comment,
              task
            });
          }
        });
      }
    }

    // Create notifications for task assignees
    if (task.assignedTo && task.assignedTo.length > 0) {
      const commentNotifications = task.assignedTo
        .filter(user => user._id.toString() !== req.user.id)
        .map(user => ({
          recipient: user._id,
          sender: req.user.id,
          type: 'comment_added',
          title: 'New comment',
          message: `${req.user.name} commented on: ${task.title}`,
          link: `/projects/${task.project}/tasks/${task._id}`,
          project: task.project,
          task: task._id
        }));

      if (commentNotifications.length > 0) {
        await Notification.insertMany(commentNotifications);
      }
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('comment_added', {
      comment,
      task: task._id
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only comment owner can update
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    req.body.edited = true;
    req.body.editedAt = Date.now();

    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('user', 'name email avatar')
    .populate('mentions', 'name email');

    // Get task for socket event
    const task = await Task.findById(comment.task);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('comment_updated', comment);

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only comment owner can delete
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Remove comment from task
    await Task.findByIdAndUpdate(comment.task, {
      $pull: { comments: comment._id }
    });

    // Get task for socket event
    const task = await Task.findById(comment.task);

    await comment.deleteOne();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('comment_deleted', comment._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
