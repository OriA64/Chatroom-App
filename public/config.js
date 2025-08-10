// API Configuration
export const API_CONFIG = {
  // Use the Vite environment variable if available, otherwise default to relative path
  BASE_URL: import.meta.env.VITE_API_URL || '',
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/login',
    SIGNUP: '/api/signup',
    LOGOUT: '/api/logout',
    
    // Admin endpoints
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_LOGOUT: '/api/admin/logout',
    ADMIN_STATS: '/api/stats',
    
    // General endpoints
    STATS: '/api/stats'
  },
  
  // Get full API URL for a specific endpoint
  getUrl: function(endpoint) {
    return `${this.BASE_URL}${endpoint}`;
  }
};
