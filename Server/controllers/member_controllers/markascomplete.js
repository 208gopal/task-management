const Task = require("../../models/task.js");

// Export as controller function
exports.completeTask = async (req, res) => {
  const { title } = req.body;  
  const userId = req.user.id; 

  try {
    // Find the task based on assignedToUser and title
    const task = await Task.findOne({ assignedToUser: userId, title });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update status to completed
    task.status = "completed";
    task.completedAt = new Date();

    await task.save();

    res.json({
      message: `Task marked as completed`,
      task
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

