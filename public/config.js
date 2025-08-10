// API Configuration
export const API_CONFIG = {
  // Use the Vite environment variable if available, otherwise default to relative path
  BASE_URL: import.meta.env.VITE_API_URL || '',
  
  // API endpoints
  ENDPOINTS: {
    LOGIN: '/api/login',
    SIGNUP: '/api/signup',
    LOGOUT: '/api/logout',
    STATS: '/api/stats'
  },
  
  // Get full API URL for a specific endpoint
  getUrl: function(endpoint) {
    return `${this.BASE_URL}${endpoint}`;
  }
};
