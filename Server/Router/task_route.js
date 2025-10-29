const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

// Import task controllers
const { getTasksByUser } = require('../controllers/member_controllers/availabletask.js');
const { acceptTask } = require('../controllers/member_controllers/acceptTask');
const { getOngoingTasksByUser } = require('../controllers/member_controllers/currenttask');
const { completeTask } = require('../controllers/member_controllers/markascomplete');
const { rejectTask } = require('../controllers/member_controllers/rejecttask');
const { getTasksByStatus } = require('../controllers/member_controllers/taskfilter');
const { createTask } = require("../controllers/Head_Controls/taskCreator.js");
const { getTasksAssignedByHead } = require("../controllers/Head_Controls/manageTask.js"); 
const { getAllTasksForAdmin, updateTaskStatusById } = require("../controllers/Head_Controls/adminTasks.js");
const { getMyTasks } = require('../controllers/member_controllers/mytasks.js');

// =================== TASK ROUTES ===================

// Get available tasks for user
router.get('/available', verifyToken, getTasksByUser);

// Accept a task
router.put('/accept', verifyToken, acceptTask);

// Get ongoing tasks for user
router.get('/ongoing', verifyToken, getOngoingTasksByUser);

// Mark task as complete
router.put('/complete', verifyToken, completeTask);

// Create a new task (admin only)
router.post('/create', verifyToken, requireAdmin, createTask);

// Reject a task
router.put('/reject', verifyToken, rejectTask);

// Get tasks by status
router.get('/status', verifyToken, getTasksByStatus);

// Get all tasks assigned by the logged-in head
router.get('/head/assigned', verifyToken, requireAdmin, getTasksAssignedByHead);

// Admin: get all tasks
router.get('/admin/all', verifyToken, requireAdmin, getAllTasksForAdmin);

// Admin: update any task status by id
router.put('/admin/status', verifyToken, requireAdmin, updateTaskStatusById);

// Get all tasks assigned to the logged-in user
router.get('/my', verifyToken, getMyTasks);

module.exports = router;
