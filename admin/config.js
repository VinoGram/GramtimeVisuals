// Admin configuration
// Change this to your backend URL when deploying
const ADMIN_CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://your-backend-url.com/api',
};