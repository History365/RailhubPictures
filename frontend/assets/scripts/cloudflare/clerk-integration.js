/**
 * RailHub Pictures Clerk Auth Integration
 * 
 * This file integrates Clerk authentication with the RailHub API
 */

// Function to load Clerk script
function loadClerkScript() {
  return new Promise((resolve, reject) => {
    // Check if Clerk is already loaded
    if (window.Clerk) {
      resolve(window.Clerk);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cdn.clerk.dev/v1/clerk.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Initialize Clerk with your publishable key
      window.Clerk.load({
        publishableKey: 'pk_your_clerk_publishable_key' // Replace with your actual key
      }).then(clerk => {
        resolve(clerk);
      }).catch(error => {
        reject(error);
      });
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
