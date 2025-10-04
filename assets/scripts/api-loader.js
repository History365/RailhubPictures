/**
 * API Loader Script
 * Handles API endpoint configuration and provides debugging for API requests
 */

// Global API configuration
window.API_CONFIG = {
  BASE_URL: 'https://railhubpictures.org',
  DEBUG: true  // Enable debug mode to log all API calls
};

// Debug function to log API calls
function logApiCall(endpoint, headers, method) {
  if (window.API_CONFIG.DEBUG) {
    console.group('API Request Debug');
    console.log('Endpoint:', endpoint);
    console.log('Method:', method || 'GET');
    console.log('Headers:', headers);
    console.log('Authorization:', headers.Authorization ? 'Present' : 'Missing');
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
}

// Check if Clerk is properly loaded and configured
function checkClerkSetup() {
  console.group('Clerk Setup Check');
  
  // Check if Clerk is available
  if (!window.Clerk) {
    console.error('Clerk is not available on the window object');
    console.groupEnd();
    return false;
  }
  
  console.log('Clerk is available on the window object');
  
  // Wait for Clerk to be ready
  window.Clerk.addListener(({ user }) => {
    console.log('Clerk user state changed:', user ? 'User is signed in' : 'No user');
    
    // If user is signed in, check if we can get a token
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.primaryEmailAddress?.emailAddress);
      
      // Try to get the session token
      window.Clerk.session.getToken().then(token => {
        console.log('Token available:', !!token);
        if (token) {
          console.log('Token prefix:', token.substring(0, 10) + '...');
        }
      }).catch(error => {
        console.error('Failed to get token:', error);
      });
    }
  });
  
  console.groupEnd();
  return true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('API Loader initialized');
  setTimeout(checkClerkSetup, 2000); // Check Clerk setup after a delay
});

// Global API fetch wrapper with auth headers
window.fetchWithAuth = async (endpoint, options = {}) => {
  try {
    // Wait for Clerk to be ready
    if (window.Clerk && !window.Clerk.isReady) {
      await new Promise(resolve => {
        const checkReady = setInterval(() => {
          if (window.Clerk.isReady) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);
      });
    }
    
    const headers = { 
      'Content-Type': 'application/json',
      ...options.headers 
    };
    
    // Add auth token if user is signed in
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Ensure endpoint starts with /api/
    const apiEndpoint = endpoint.startsWith('/api/') 
      ? endpoint 
      : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const url = new URL(`${window.API_CONFIG.BASE_URL}${apiEndpoint}`);
    
    // Log the API call for debugging
    logApiCall(url.toString(), headers, options.method);
    
    // Make the request
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP Error ${response.status}` 
      }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};