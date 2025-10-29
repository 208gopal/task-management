const User = require('../models/user');

exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { name, email, branch, year, section, department } = req.body;

    const update = {};
    if (typeof name === 'string') update.name = name;
    if (typeof email === 'string') update.email = email;
    if (typeof branch === 'string') update.branch = branch;
    if (typeof year === 'string') update.year = year;
    if (typeof section === 'string') update.section = section;
    if (typeof department === 'string') update.department = department;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true, select: '-password -__v' }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.listAssignees = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const filter = { _id: { $ne: currentUser._id } };
    if (req.user.role === 'head-of-dept' && currentUser.department) {
      filter.department = currentUser.department;
    }

    const users = await User.find(filter).select('name email department role');
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error listing assignees:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};