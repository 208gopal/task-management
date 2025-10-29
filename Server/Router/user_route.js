const express = require('express');
const router = express.Router();
const { changePassword } = require('../controllers/changepassword');
const { getMe, updateMe, listAssignees } = require('../controllers/profile');
const { verifyToken } = require('../Middleware/authMiddleware');

// Change password (protected route)
router.put('/change-password', verifyToken, changePassword);

// Current user profile
router.get('/me', verifyToken, getMe);

// Update current user profile
router.put('/me', verifyToken, updateMe);

// Assignee list for task assignment
router.get('/assignees', verifyToken, listAssignees);


module.exports = router;

