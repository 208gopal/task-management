const Task = require('../../models/task.js');

// Controller to show tasks by user ID and status 'ongoing'
exports.getOngoingTasksByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const tasks = await Task.find(
            { assignedToUser: userId, status: 'ongoing' }
        ).select('title description deadline');

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
