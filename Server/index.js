require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./Router/auth');
const userRoutes = require('./Router/user_route');
const taskRoutes = require('./Router/task_route');
const memberRequestRoutes = require('./Router/memberRequestRoutes');
const { signup } = require('./controllers/authController');

const app = express();

// Hard-set CORS headers and short-circuit OPTIONS preflights before any other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] Preflight for ${req.originalUrl}`);
    return res.sendStatus(204);
  }
  next();
});

// =================== CORS ===================
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Extra safety: ensure CORS headers on every response and handle preflight
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ✅ Handle preflight requests safely for Express 5
app.options(/.*/, cors(corsOptions));

// =================== MIDDLEWARE ===================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =================== LOGGER ===================
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// =================== ROUTES ===================
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/member-requests', memberRequestRoutes);

// =================== ERROR HANDLER ===================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// =================== DATABASE ===================
const PORT = process.env.PORT || 7001;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));