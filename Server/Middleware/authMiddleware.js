const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// =================== AUTHENTICATION MIDDLEWARE ===================
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  console.log("Header Authorization:", req.header('Authorization'));
  console.log("Token after Bearer removal:", token);

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Admin-only access
const requireAdmin = (req, res, next) => {
  const adminRoles = ['head-of-dept', 'core-member']; // roles considered as admin
  if (!adminRoles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied: Admins only.' });
  }
  next();
};

// =================== EXPORT ALL MIDDLEWARE ===================
module.exports = {
  verifyToken,
  requireAdmin,
};
