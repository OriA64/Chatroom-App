const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

// For serverless environment, use persistent storage simulation
// Since SQLite doesn't work reliably in serverless, we'll use a global object
// that persists during the function's lifetime
global.serverlessUsers = global.serverlessUsers || new Map();

function getServerlessDB() {
  return {
    users: global.serverlessUsers,
    
    createUser: async (name, hashedPassword) => {
      if (global.serverlessUsers.has(name)) {
        throw new Error('User already exists');
      }
      const user = {
        name,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        last_login: null
      };
      global.serverlessUsers.set(name, user);
      return user;
    },
    
    getUser: (name) => {
      return global.serverlessUsers.get(name);
    },
    
    updateLastLogin: (name) => {
      const user = global.serverlessUsers.get(name);
      if (user) {
        user.last_login = new Date().toISOString();
        global.serverlessUsers.set(name, user);
      }
    },
    
    getAllUsers: () => {
      return Array.from(global.serverlessUsers.values());
    },
    
    getUserCount: () => {
      return global.serverlessUsers.size;
    }
  };
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, name, password } = JSON.parse(event.body);

    const db = getServerlessDB();

    switch (action) {
      case 'signup':
        if (!name || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Name and password are required' })
          };
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.createUser(name, hashedPassword);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Account created successfully' })
          };
        } catch (error) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: error.message })
          };
        }

      case 'login':
        if (!name || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Name and password are required' })
          };
        }

        const user = db.getUser(name);
        if (!user) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid credentials' })
          };
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid credentials' })
          };
        }

        // Update last login
        db.updateLastLogin(name);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Login successful' })
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
