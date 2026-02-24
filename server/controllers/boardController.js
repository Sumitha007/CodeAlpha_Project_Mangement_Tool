const Board = require('../models/Board');
const Project = require('../models/Project');

// @desc    Get all boards for a project
// @route   GET /api/boards?project=projectId
// @access  Private
exports.getBoards = async (req, res, next) => {
  try {
    const { project } = req.query;

    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID'
      });
    }

    // Check if user has access to project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isMember = projectDoc.owner.toString() === req.user.id ||
      projectDoc.members.some(m => m.user.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    const boards = await Board.find({ project })
      .populate('tasks')
      .sort('position');

    res.status(200).json({
      success: true,
      count: boards.length,
      data: boards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id).populate('tasks');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    res.status(200).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
exports.createBoard = async (req, res, next) => {
  try {
    const { project } = req.body;

    // Check if user has access to project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const userRole = projectDoc.members.find(m => m.user.toString() === req.user.id)?.role;
    if (projectDoc.owner.toString() !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create boards in this project'
      });
    }

    const board = await Board.create(req.body);

    // Add board to project
    projectDoc.boards.push(board._id);
    await projectDoc.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${project}`).emit('board_created', board);

    res.status(201).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
exports.updateBoard = async (req, res, next) => {
  try {
    let board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    board = await Board.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${board.project}`).emit('board_updated', board);

    res.status(200).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
exports.deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Remove board from project
    await Project.findByIdAndUpdate(board.project, {
      $pull: { boards: board._id }
    });

    await board.deleteOne();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${board.project}`).emit('board_deleted', board._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
