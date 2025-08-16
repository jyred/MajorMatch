// API Base URL configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production (same domain)
  : 'http://localhost:5000'; // Development server

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    USER: '/api/user'
  },
  ASSESSMENT: {
    ANALYZE_RIASEC: '/api/analyze-riasec',
    RECOMMEND_MAJORS: '/api/recommend-majors',
    ASSESSMENTS: '/api/assessments'
  },
  CHAT: {
    CHAT: '/api/chat'
  },
  SATISFACTION: {
    SURVEYS: '/api/satisfaction-surveys'
  }
};

// Utility function to build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}
