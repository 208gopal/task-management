const User = require('../models/user.js');
const MemberRequest = require('../models/memberRequest.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Use a default secret in dev to avoid 500s when JWT_SECRET is missing
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

// ========================== SIGNUP ==========================
exports.signup = async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    const { name, email, phone, password, role, branch, year, section, department } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists (by email or phone)
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exists with this email or phone.' });
    }

    // Create new user (requires admin approval)
    const newUser = new User({
      name,
      email,
      phone,
      password: password,
      role: role || 'member',
      branch: branch || '',
      year: year || '',
      section: section || '',
      department: department || '',
      accepted: false,
      isActive: false,
    });

    await newUser.save();

    // Create member request for admin approval
    try {
      await MemberRequest.create({
        userId: newUser._id,
        fullName: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phone,
        role: newUser.role,
        status: 'pending',
        submittedAt: new Date(),
      });
    } catch (e) {
      console.error('MemberRequest create error:', e);
      return res.status(500).json({ message: 'Failed to create member request', error: String(e?.message || e) });
    }

    res.status(201).json({
      message: 'Signup successful. Awaiting admin approval.',
    });
  } catch (err) {
    console.error('Signup Error:', err);
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error', error: String(err?.message || err) });
  }
};

// ========================== LOGIN ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found with this role.' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if admin has approved this user
    if (!user.accepted) {
      const existingRejected = await MemberRequest.findOne({ userId: user._id, status: 'rejected' });
      if (existingRejected) {
        return res.status(403).json({ message: 'Your membership request was rejected. Contact admin for reconsideration.' });
      }

      const existingPending = await MemberRequest.findOne({ userId: user._id, status: 'pending' });
      if (!existingPending) {
        await MemberRequest.create({
          userId: user._id,
          fullName: user.name,
          email: user.email,
          phoneNumber: user.phone,
          role: user.role,
          status: 'pending',
          submittedAt: new Date(),
        });
      }

      return res.status(403).json({
        message: 'Your account is pending admin approval. Please wait for confirmation.',
      });
    }

    // ✅ User is approved → generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
        year: user.year,
        section: user.section,
        department: user.department,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
