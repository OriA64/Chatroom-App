require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');
const db = require('./services/dbService');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Session store
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions'
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'modern-pastel-secret-key',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/hello', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'hello.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/admin-login');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// API Routes
app.post('/api/signup', async (req, res) => {
  const { name, password } = req.body;
  
  try {
    const user = await db.createUser(name, password);
    req.session.user = { id: user.id, name: user.name };
    res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;
  
  try {
    const user = await db.authenticateUser(name, password);
    req.session.user = { id: user.id, name: user.name };
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  // In a real app, you'd check if the user is an admin
  // For now, we'll just check if the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  // In a real app, you'd verify admin credentials here
  // For now, we'll use a simple hardcoded admin user
  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = { username: 'admin' };
    return res.json({ success: true, message: 'Admin login successful' });
  }
  
  res.status(401).json({ success: false, error: 'Invalid admin credentials' });
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  delete req.session.admin;
  res.json({ success: true, message: 'Admin logged out' });
});

// Get user statistics (for admin)
app.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const totalUsers = users.length;
    
    // Calculate recent logins (last 24 hours)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogins = users.filter(user => {
      return user.last_login && new Date(user.last_login) > yesterday;
    }).length;
    
    const newUsers = users.filter(user => {
      return new Date(user.created_at) > yesterday;
    }).length;

    res.json({
      success: true,
      totalUsers,
      recentLogins,
      newUsers,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login,
        login_count: user.login_count || 0
      })).sort((a, b) => new Date(b.last_login) - new Date(a.last_login))
    });
  } catch (error) {
    console.error('Error in /api/stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
