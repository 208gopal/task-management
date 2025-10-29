const Task = require('../../models/task.js');

// Return all tasks assigned to the authenticated user (any status)
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ assignedToUser: userId })
      .sort({ createdAt: -1 })
      .select('title description deadline status rejectionReason createdAt updatedAt');
    return res.json({ success: true, total: tasks.length, tasks });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


