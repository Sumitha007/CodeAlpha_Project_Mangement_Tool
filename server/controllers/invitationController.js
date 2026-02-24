const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const User = require('../models/User');
const crypto = require('crypto');
const { sendInvitationEmail, sendInvitationAcceptedEmail } = require('../utils/emailService');

// @desc    Send project invitation
// @route   POST /api/invitations
// @access  Private
exports.sendInvitation = async (req, res, next) => {
  try {
    const { email, projectId, role = 'member' } = req.body;

    if (!email || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and project ID'
      });
    }

    // Check if project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is project owner or admin
    const userMembership = project.members.find(
      m => m.user.toString() === req.user.id
    );
    if (!userMembership || (userMembership.role !== 'owner' && userMembership.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners and admins can send invitations'
      });
    }

    // Check if user is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const alreadyMember = project.members.some(
        m => m.user.toString() === existingUser._id.toString()
      );
      if (alreadyMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this project'
        });
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      email,
      project: projectId,
      status: 'pending'
    });

    if (existingInvitation && !existingInvitation.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'An invitation has already been sent to this email'
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = await Invitation.create({
      email,
      project: projectId,
      invitedBy: req.user.id,
      role,
      token
    });

    // Send email
    const emailResult = await sendInvitationEmail(
      email,
      req.user.name,
      project.name,
      token
    );

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      // Continue anyway - invitation is created
    }

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        _id: invitation._id,
        email: invitation.email,
        status: invitation.status,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invitations for a project
// @route   GET /api/invitations?project=projectId
// @access  Private
exports.getInvitations = async (req, res, next) => {
  try {
    const { project } = req.query;

    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID'
      });
    }

    // Check if user is project member
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isMember = projectDoc.members.some(
      m => m.user.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const invitations = await Invitation.find({ project })
      .populate('invitedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invitation by token
// @route   GET /api/invitations/token/:token
// @access  Public
exports.getInvitationByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token })
      .populate('project', 'name description')
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This invitation has been ${invitation.status}`
      });
    }

    res.status(200).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept invitation
// @route   POST /api/invitations/:token/accept
// @access  Private
exports.acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token })
      .populate('project')
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This invitation has been ${invitation.status}`
      });
    }

    // Check if user's email matches invitation email
    if (req.user.email !== invitation.email) {
      return res.status(403).json({
        success: false,
        message: 'This invitation is for a different email address'
      });
    }

    // Add user to project
    const project = await Project.findById(invitation.project._id);
    
    // Check if already a member
    const alreadyMember = project.members.some(
      m => m.user.toString() === req.user.id
    );

    if (!alreadyMember) {
      project.members.push({
        user: req.user.id,
        role: invitation.role
      });
      await project.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Send notification to inviter
    await sendInvitationAcceptedEmail(
      invitation.invitedBy.email,
      req.user.name,
      project.name
    );

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project_${project._id}`).emit('member_joined', {
      project: project._id,
      user: {
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        projectId: project._id,
        projectName: project.name
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline invitation
// @route   POST /api/invitations/:token/decline
// @access  Public
exports.declineInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This invitation has been ${invitation.status}`
      });
    }

    invitation.status = 'declined';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation declined'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/Delete invitation
// @route   DELETE /api/invitations/:id
// @access  Private
exports.cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if user is the inviter or project owner
    const project = await Project.findById(invitation.project);
    const userMembership = project.members.find(
      m => m.user.toString() === req.user.id
    );

    if (!userMembership || 
        (userMembership.role !== 'owner' && 
         userMembership.role !== 'admin' && 
         invitation.invitedBy.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this invitation'
      });
    }

    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invitation cancelled'
    });
  } catch (error) {
    next(error);
  }
};
