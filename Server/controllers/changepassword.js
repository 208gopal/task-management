const User = require('../models/user.js');
const bcrypt = require('bcryptjs');

exports.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'New password and confirmation are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // 1: Find the user by ID
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2: Assign new password in plain text; pre-save hook will hash once
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
