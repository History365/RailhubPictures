/**
 * Initialize global RailHub API instance
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create global API instance
  window.railhubAPI = new RailHubAPI();
  console.log('Global API client initialized');
  
  // Initialize Clerk authentication if the script is loaded
  if (typeof initClerkAuth === 'function') {
    initClerkAuth().then(clerk => {
      if (clerk && clerk.user) {
        console.log('User already authenticated');
      }
    });
  }
});
