const Task = require('../../models/task.js');

// Get all tasks for admins/heads (optionally filter by future deadlines on client)
exports.getAllTasksForAdmin = async (req, res) => {
  try {
    // heads and core-members are allowed by middleware
    const tasks = await Task.find({}).populate('assignedToUser', 'name email role').sort({ createdAt: -1 });
    const response = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description,
      status: t.status,
      deadline: t.deadline,
      assignedTo: t.assignedTo,
      assignedToUser: t.assignedToUser,
      createdAt: t.createdAt,
    }));
    res.json({ tasks: response });
  } catch (e) {
    console.error('getAllTasksForAdmin error', e);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update any task status by id (admin-only)
exports.updateTaskStatusById = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ message: 'id and status are required' });
    }
    const allowed = ['available', 'ongoing', 'completed', 'rejected', 'overdue'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }
    await task.save();
    res.json({ message: `Task updated to ${status}`, task });
  } catch (e) {
    console.error('updateTaskStatusById error', e);
    res.status(500).json({ message: 'Server error' });
  }
};


