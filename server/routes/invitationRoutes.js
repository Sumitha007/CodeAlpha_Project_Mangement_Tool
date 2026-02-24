const express = require('express');
const router = express.Router();
const {
  sendInvitation,
  getInvitations,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  cancelInvitation
} = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

// Public route to get invitation details
router.get('/token/:token', getInvitationByToken);

// Public route to decline invitation
router.post('/:token/decline', declineInvitation);

// Protected routes
router.use(protect);

router.route('/')
  .post(sendInvitation)
  .get(getInvitations);

router.post('/:token/accept', acceptInvitation);
router.delete('/:id', cancelInvitation);

module.exports = router;
