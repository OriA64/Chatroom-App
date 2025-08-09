const User = require('../models/User');

class DBService {
  // Create a new user
  async createUser(name, password) {
    try {
      const user = new User({ name, password });
      await user.save();
      return {
        id: user._id,
        name: user.name,
        created_at: user.created_at,
        last_login: user.last_login
      };
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        throw new Error('User already exists');
      }
      throw error;
    }
  }

  // Get user by name
  async getUser(name) {
    return await User.findOne({ name }).select('-password');
  }

  // Authenticate user
  async authenticateUser(name, password) {
    const user = await User.findOne({ name });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    return {
      id: user._id,
      name: user.name,
      created_at: user.created_at,
      last_login: user.last_login
    };
  }

  // Get all users
  async getAllUsers() {
    return await User.find({}).select('-password').sort({ created_at: -1 });
  }

  // Get user count
  async getUserCount() {
    return await User.countDocuments();
  }
}

module.exports = new DBService();
