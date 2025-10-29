const Task = require("../../models/task.js");

exports.rejectTask = async (req, res) => {
  const { title, status, rejectionReason } = req.body;
  const userId = req.user.id;

  try {
    const task = await Task.findOne({ assignedToUser: userId, title });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;

    if (status === "rejected") {
      task.rejectionReason = rejectionReason;
    }

    await task.save();

    res.json({
      message: `Task status updated to "${status}"`,
      task
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};