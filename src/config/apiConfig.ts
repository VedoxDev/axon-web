// API Configuration for different environments
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Configure API base URL based on environment
export const API_BASE_URL = (() => {
  if (isDevelopment) {
    // In development, use proxy (works with Vite dev server)
    return '/api';
  } else if (isProduction) {
    // In production, use your actual backend URL
    // Replace this with your actual production backend URL
    return import.meta.env.VITE_API_URL || 'https://axon-backend-production.up.railway.app';
  }
  // Fallback
  return '/api';
})();

// LiveKit Configuration for Video Calls
export const LIVEKIT_URL = 'wss://axon-68rmd4dw.livekit.cloud';

// Debug logging (remove in production)
if (isDevelopment) {
  console.log('🔧 Development mode - API URL:', API_BASE_URL);
} else {
  console.log('🚀 Production mode - API URL:', API_BASE_URL);
}
