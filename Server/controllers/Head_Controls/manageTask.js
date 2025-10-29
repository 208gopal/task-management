const Task = require('../../models/task.js');
const User = require('../../models/user.js');

// Controller: Get all tasks assigned by the logged-in head
const getTasksAssignedByHead = async (req, res) => {
  try {
    // Ensure the logged-in user is a head
    if (!['head-of-dept', 'core-member'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Only heads can view assigned tasks.' });
    }

    // Fetch tasks created by this head
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate('assignedToUser', 'name email role') // populate assigned user details
      .sort({ createdAt: -1 }); // newest first

    // Format response
    const response = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      assignedToUser: task.assignedToUser,
      status: task.status,
      deadline: task.deadline,
      createdAt: task.createdAt
    }));

    res.status(200).json({ success: true, tasks: response });
  } catch (error) {
    console.error('Error fetching tasks assigned by head:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getTasksAssignedByHead };
