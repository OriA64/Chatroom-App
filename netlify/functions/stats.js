// Use the same serverless database approach as auth function
global.serverlessUsers = global.serverlessUsers || new Map();

function getServerlessDB() {
  return {
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const db = getServerlessDB();
    
    const userCount = db.getUserCount();
    const users = db.getAllUsers();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalUsers: userCount,
        users: users
      })
    };
  } catch (error) {
    console.error('Stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get statistics',
        totalUsers: 0,
        users: []
      })
    };
  }
};
