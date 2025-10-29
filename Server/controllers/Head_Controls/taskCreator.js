const User = require("../../models/user.js");
const Task = require("../../models/task.js");

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline } = req.body;

    const assignedUser = await User.findOne({
      $or: [
        { email: assignedTo },
        { name: { $regex: assignedTo, $options: "i" } }
      ]
    });

    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found"
      });
    }

    const TaskDB = new Task({
      title,
      description,
      assignedTo,
      assignedToUser: assignedUser._id,
      deadline,
      createdBy: req.user.id,
      status: "available"
    });

    await TaskDB.save();

    res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      task: TaskDB
    });
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

module.exports = { createTask };