const Task = require('../../models/task.js');

// Controller to change task status from 'available' to 'ongoing'
exports.acceptTask = async (req, res) => {
    const { title } = req.body;  
    const userId = req.user.id;

    // Validate input
    if (!title || !userId) {
        return res.status(400).json({ message: 'Title and userId are required.' });
    }

    try {
        // Find the task by title and userId, and status 'available'
        const task = await Task.findOne({ title, assignedToUser: userId, status: 'available' });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or not available' });
        }

        // Update status to 'ongoing'
        task.status = 'ongoing';
        await task.save();

        res.json({ message: 'Task status updated to ongoing', task });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};