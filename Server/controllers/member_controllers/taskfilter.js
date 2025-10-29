const Task = require('../../models/task.js');

// Controller to get tasks by status
exports.getTasksByStatus = async (req, res) => {
    try {
        const userId = req.user.Id;
        const status = req.query.status; // get status from query string

        let filter = { assignedToUser: userId };

        // If status is provided and is not "all", add it to the filter
        if (status && status !== 'all') {
            filter.status = status;
        } else if (status === 'all') {
            // Optional: exclude 'available' if you want "all" to mean non-available tasks
            filter.status = { $ne: 'available' };
        }

        const tasks = await Task.find(filter)
            .select('title description deadline status rejectionReason completedAt');

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
