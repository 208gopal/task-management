const Task = require('../../models/task.js');

// Controller to get available tasks assigned to a user based on status
exports.getTasksByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find tasks assigned to the user with status 'available'
        const tasks = await Task.find({ assignedToUser: userId, status: 'available' })
            .select('title deadline description');
            
        res.status(200).json({
            totalTasks: tasks.length,
            tasks: tasks
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};
