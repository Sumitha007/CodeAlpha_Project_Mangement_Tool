const Project = require('../models/Project');
const Board = require('../models/Board');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../utils/emailService');

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('boards')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('boards');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is member of project
    const isMember = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user._id.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    
    // Extract member emails for invitations
    const memberEmails = req.body.memberEmails || [];
    delete req.body.memberEmails;
    
    // Add owner as a member with owner role
    req.body.members = [{
      user: req.user.id,
      role: 'owner'
    }];

    const project = await Project.create(req.body);

    // Create default boards
    const defaultBoards = [
      { name: 'To Do', project: project._id, position: 0 },
      { name: 'In Progress', project: project._id, position: 1 },
      { name: 'Review', project: project._id, position: 2 },
      { name: 'Done', project: project._id, position: 3 }
    ];

    const boards = await Board.insertMany(defaultBoards);
    project.boards = boards.map(b => b._id);
    await project.save();

    // Send invitations to member emails
    const invitations = [];
    for (const email of memberEmails) {
      if (email && email.trim() && email !== req.user.email) {
        try {
          const token = crypto.randomBytes(32).toString('hex');
          const invitation = await Invitation.create({
            email: email.trim().toLowerCase(),
            project: project._id,
            invitedBy: req.user.id,
            role: 'member',
            token
          });
          
          // Send email
          await sendInvitationEmail(
            email.trim(),
            req.user.name,
            project.name,
            token
          );
          
          invitations.push(invitation);
        } catch (error) {
          console.error(`Failed to send invitation to ${email}:`, error.message);
        }
      }
    }

    // Populate before sending response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');
    await project.populate('boards');

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('project_created', project);

    res.status(201).json({
      success: true,
      data: project,
      invitationsSent: invitations.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or admin
    const userRole = project.members.find(m => m.user.toString() === req.user.id)?.role;
    if (project.owner.toString() !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('boards');

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${project._id}`).emit('project_updated', project);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner can delete project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete the project'
      });
    }

    // Delete all boards and tasks associated with project
    await Board.deleteMany({ project: project._id });
    
    await project.deleteOne();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${project._id}`).emit('project_deleted', project._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or admin
    const userRole = project.members.find(m => m.user.toString() === req.user.id)?.role;
    if (project.owner.toString() !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isMember = project.members.some(m => m.user.toString() === user._id.toString());
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add member
    project.members.push({
      user: user._id,
      role: role || 'member'
    });

    await project.save();
    await project.populate('members.user', 'name email avatar');

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${project._id}`).emit('member_added', { project: project._id, member: user });
    io.to(`user_${user._id}`).emit('added_to_project', project);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or admin
    const userRole = project.members.find(m => m.user.toString() === req.user.id)?.role;
    if (project.owner.toString() !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members'
      });
    }

    // Cannot remove owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await project.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${project._id}`).emit('member_removed', { project: project._id, userId: req.params.userId });
    io.to(`user_${req.params.userId}`).emit('removed_from_project', project._id);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};
