const API_PORT = window.__API_PORT__ || '8000';
export const API_BASE_URL = window.__API_BASE_URL__ || `http://localhost:${API_PORT}/api/v1`;
export const API_TIMEOUT_MS = 10000; 
export const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

