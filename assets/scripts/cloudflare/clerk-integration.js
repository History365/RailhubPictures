/**
 * RailHub Pictures Clerk Auth Integration
 * 
 * This file integrates Clerk authentication with the RailHub API
 * IMPORTANT: This file is being deprecated in favor of clerk-auth.js
 * This file is kept for backward compatibility only
 */

// Import functions from clerk-auth.js
console.log('Loading clerk-integration.js (deprecated)');
console.log('This file is deprecated. Use clerk-auth.js instead.');

// Function to load Clerk script - THIS IS DEPRECATED, DO NOT USE
function loadClerkScript() {
  console.warn('loadClerkScript is deprecated. The Clerk script should be loaded in HTML.');
  return new Promise((resolve, reject) => {
    // Check if Clerk is already loaded
    if (window.Clerk) {
      console.log('Clerk already loaded, using existing instance');
      resolve(window.Clerk);
      return;
    }

    console.error('Clerk should be loaded via HTML script tag with proper publishable key');
    reject(new Error('Clerk loading method deprecated'));
    
    // NO LONGER USED - Clerk is now loaded via HTML script tag
    // with the correct publishable key: pk_test_Y29tbXVuYWwtY2F0LTI1LmNsZXJrLmFjY291bnRzLmRldiQ
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Clerk script'));
    };
    
    document.head.appendChild(script);
  });
}

// Initialize Clerk and listen for auth changes
async function initClerkAuth() {
  try {
    const clerk = await loadClerkScript();
    
    // Wait for user to be loaded
    await clerk.load();
    
    // Add auth state change listener
    clerk.addListener(({ user }) => {
      // If signed in, pass token to API client
      if (user) {
        clerk.session.getToken().then(token => {
          if (token && window.railhubAPI) {
            window.railhubAPI.setToken(token);
            console.log('User authenticated with Clerk:', user.firstName);
          }
        });
      } else {
        // If signed out, clear token
        if (window.railhubAPI) {
          window.railhubAPI.clearToken();
          console.log('User signed out');
        }
      }
    });
    
    // Return Clerk instance
    return clerk;
  } catch (error) {
    console.error('Failed to initialize Clerk:', error);
    return null;
  }
}

// Create UI elements for authentication
function createAuthButtons(targetElement) {
  // Check if target element exists
  const target = document.querySelector(targetElement);
  if (!target) return;
  
  // Create buttons container
  const authContainer = document.createElement('div');
  authContainer.className = 'clerk-auth-buttons';
  authContainer.style.display = 'flex';
  authContainer.style.gap = '10px';
  
  // Sign In button
  const signInButton = document.createElement('button');
  signInButton.textContent = 'Sign In';
  signInButton.className = 'clerk-sign-in-button';
  signInButton.addEventListener('click', () => {
    if (window.Clerk) {
      window.Clerk.openSignIn();
    }
  });
  
  // Sign Up button
  const signUpButton = document.createElement('button');
  signUpButton.textContent = 'Sign Up';
  signUpButton.className = 'clerk-sign-up-button';
  signUpButton.addEventListener('click', () => {
    if (window.Clerk) {
      window.Clerk.openSignUp();
    }
  });
  
  // User button (shown when signed in)
  const userButton = document.createElement('div');
  userButton.className = 'clerk-user-button';
  userButton.style.display = 'none';
  
  // Add buttons to container
  authContainer.appendChild(signInButton);
  authContainer.appendChild(signUpButton);
  authContainer.appendChild(userButton);
  
  // Add container to target element
  target.appendChild(authContainer);
  
  // Update UI based on auth state
  if (window.Clerk) {
    window.Clerk.addListener(({ user }) => {
      if (user) {
        signInButton.style.display = 'none';
        signUpButton.style.display = 'none';
        userButton.style.display = 'block';
        
        // Create user profile button or use Clerk's built-in user button
        window.Clerk.mountUserButton(userButton);
      } else {
        signInButton.style.display = 'block';
        signUpButton.style.display = 'block';
        userButton.style.display = 'none';
      }
    });
  }
}

// Initialize everything once DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize Clerk
    const clerk = await initClerkAuth();
    
    // If user is already signed in, get the token and set it in the API client
    if (clerk && clerk.user) {
      const token = await clerk.session.getToken();
      if (token && window.railhubAPI) {
        window.railhubAPI.setToken(token);
      }
    }
    
    // Create auth UI if header exists
    createAuthButtons('#header-placeholder .header .nav-links');
  } catch (error) {
    console.error('Error initializing authentication:', error);
  }
});
