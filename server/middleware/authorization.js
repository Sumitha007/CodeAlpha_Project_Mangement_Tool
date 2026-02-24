const Project = require('../models/Project');

// Check if user is a member of the project
exports.checkProjectMembership = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.project || req.query.project;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or member
    const isMember = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // Attach project to request for further use
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is project owner or admin
exports.checkProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.project || req.query.project;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or admin
    const userMember = project.members.find(m => m.user.toString() === req.user.id);
    const isAdmin = project.owner.toString() === req.user.id ||
      (userMember && userMember.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You must be a project owner or admin to perform this action'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is project owner
exports.checkProjectOwner = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can perform this action'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};
