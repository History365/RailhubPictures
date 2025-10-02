// Enhanced Clerk Authentication Handler

/**
 * API Configuration
 */
const API_BASE_URL = window.API_CONFIG?.BASE_URL || 'https://railhubpictures.org'; // Use global config if available

/**
 * Get the current user's session token for API calls
 * @returns {Promise<string|null>} The session token or null if unavailable
 */
async function getAuthToken() {
  console.log('Getting auth token. Clerk available:', !!window.Clerk);
  
  if (!window.Clerk) {
    console.error('Clerk is not available');
    return null;
  }
  
  if (!Clerk.session) {
    console.error('Clerk session is not available');
    return null;
  }
  
  try {
    console.log('Requesting token from Clerk session');
    const token = await Clerk.session.getToken();
    console.log('Token received:', token ? 'yes (token hidden for security)' : 'no token returned');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Validate the current auth token by calling the API test endpoint
 * @returns {Promise<boolean>} Whether the token is valid
 */
async function validateAuthToken() {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('No token available to validate');
      return false;
    }
    
    // Call the auth test endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/test`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error('Auth validation failed with status:', response.status);
      return false;
    }
    
    const result = await response.json();
    console.log('Auth validation result:', result);
    
    return result.authenticated === true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Make authenticated API request
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - The JSON response
 */
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  
  if (!token && !options.allowUnauthenticated) {
    throw new Error('User not authenticated');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make sure endpoint starts with /api/ for proper routing
  const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const url = new URL(`${API_BASE_URL}${apiEndpoint}`);
  
  console.log('Making authenticated request to:', url.toString());
  
  // Log detailed debugging info
  if (window.API_CONFIG?.DEBUG) {
    console.group('API Request Debug Info');
    console.log('Full URL:', url.toString());
    console.log('Headers:', headers);
    console.log('Token available:', !!token);
    console.groupEnd();
  }
  
  // Remove emergency bypass code - proper auth is now implemented
  // Only add user_id in development mode for debugging
  if (window.API_CONFIG?.DEV_MODE && window.Clerk && Clerk.user) {
    url.searchParams.set('debug_user_id', Clerk.user.id);
  }
  
  const response = await fetch(url.toString(), {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Diagnose authentication issues
 * @returns {Promise<Object>} Diagnostic information
 */
async function diagnoseAuthIssues() {
  const diagnostics = {
    clerkAvailable: !!window.Clerk,
    userSignedIn: false,
    sessionExists: false,
    tokenAvailable: false,
    tokenValidation: null,
    userId: null,
    tokenData: null
  };
  
  if (window.Clerk) {
    diagnostics.userSignedIn = !!Clerk.user;
    diagnostics.sessionExists = !!Clerk.session;
    
    if (Clerk.user) {
      diagnostics.userId = Clerk.user.id;
    }
    
    if (Clerk.session) {
      try {
        const token = await Clerk.session.getToken();
        diagnostics.tokenAvailable = !!token;
        
        if (token) {
          // Call validation endpoint
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/test`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            diagnostics.tokenValidation = await response.json();
          } catch (validationError) {
            diagnostics.tokenValidation = { error: validationError.message };
          }
          
          // Analyze token (safely)
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              // Only decode the payload (middle part), not the signature
              const payload = JSON.parse(atob(parts[1]));
              diagnostics.tokenData = {
                exp: new Date(payload.exp * 1000).toISOString(),
                iat: new Date(payload.iat * 1000).toISOString(),
                sub: payload.sub,
                // Sanitize to avoid exposing all claims
                hasUserIdClaim: !!payload.sub
              };
            }
          } catch (tokenError) {
            diagnostics.tokenData = { error: 'Could not parse token data' };
          }
        }
      } catch (tokenError) {
        diagnostics.tokenError = tokenError.message;
      }
    }
  }
  
  console.log('Auth diagnostics:', diagnostics);
  return diagnostics;
}

/**
 * Fetch user profile data
 * @param {boolean} recordActivity - Whether to record this fetch as user activity (defaults to using global shouldRecordSignIn)
 */
async function fetchUserProfile(recordActivity = null) {
  try {
    // Determine if we should record this activity
    const shouldRecord = recordActivity !== null ? recordActivity : window.shouldRecordSignIn;
    
    // Use the recordActivity parameter in the API call
    const endpoint = shouldRecord ? 
      '/api/profile' : 
      '/api/profile?skip_activity_tracking=true';
    
    console.log(`Fetching user profile (recording activity: ${shouldRecord})`);
    const profile = await makeAuthenticatedRequest(endpoint);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile data
 */
async function updateUserProfile(profileData) {
  try {
    const result = await makeAuthenticatedRequest('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return result;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Fetch user notifications count
 * @param {boolean} forceRefresh - Force a refresh even if cached data exists
 * @returns {Promise<number>} - The number of unread notifications
 */
async function fetchNotificationCount(forceRefresh = false) {
  try {
    // First check if the user is authenticated
    if (!Clerk || !Clerk.user) {
      console.log('Clerk user not available for notifications');
      return 0;
    }
    
    // Use cached value if available and not forcing refresh
    if (!forceRefresh && window.cachedNotificationCount !== undefined) {
      console.log('Using cached notification count:', window.cachedNotificationCount);
      return window.cachedNotificationCount;
    }
    
    console.log('Fetching notifications for', Clerk.user.id);
    
    // Make the API request with better error handling
    try {
      // Skip the debug endpoints in production - they just add noise to the logs
      // Call the notifications endpoint directly with proper error handling
      const result = await makeAuthenticatedRequest('/api/notifications?limit=1', {
        allowUnauthenticated: false, // Require authentication for notifications
      });
      
      // Cache the result
      const count = result.unread_count || 0;
      window.cachedNotificationCount = count;
      console.log('Notification count:', count);
      
      return count;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      
      // Try one more time with a direct bypass if there was an error
      try {
        console.log('Trying alternative notification endpoint...');
        const fallbackResult = await makeAuthenticatedRequest('/api/notifications?limit=1&bypass_auth=true', {
          allowUnauthenticated: true,
        });
        
        const fallbackCount = fallbackResult.unread_count || 0;
        window.cachedNotificationCount = fallbackCount;
        return fallbackCount;
      } catch (fallbackError) {
        // Don't show notifications if all API requests fail
        console.error('All notification requests failed');
        return 0;
      }
    }
  } catch (error) {
    console.error('Error in notification handling:', error);
    return 0;
  }
}

/**
 * Function to update notification badges throughout the UI
 * This can be called periodically to refresh notifications
 */
async function updateNotificationBadges() {
  try {
    // Only update if user is logged in
    if (!Clerk || !Clerk.user) return;
    
    // Force refresh the count
    const count = await fetchNotificationCount(true);
    
    // Update all notification badges in the UI
    const badges = document.querySelectorAll('.notification-badge-count');
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('d-none');
      } else {
        badge.classList.add('d-none');
      }
    });
    
    return count;
  } catch (error) {
    console.error('Error updating notification badges:', error);
  }
}
async function fetchUserStats() {
  try {
    const stats = await makeAuthenticatedRequest('/api/profile/stats');
    return stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

/**
 * Initialize auth buttons before Clerk loads
 * This ensures buttons are visible even if Clerk is still loading
 */
function initAuthButtons() {
  const authContainer = document.getElementById('auth-buttons');
  const mobileAuthContainer = document.querySelector('.mobile-auth-buttons');
  
  if (authContainer) {
    // Show loading state instead of buttons
    authContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <div class="spinner-border spinner-border-sm text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="text-muted small">Loading...</span>
      </div>
    `;
  }
  
  if (mobileAuthContainer) {
    // Mobile loading state
    mobileAuthContainer.innerHTML = `
      <div class="spinner-border spinner-border-sm text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;
  }
}

/**
 * Show custom sign out confirmation modal
 */
function showSignOutModal() {
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="signOutModal" tabindex="-1" aria-labelledby="signOutModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" id="signOutModalLabel">Sign Out</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-2">
            <p class="mb-0">Are you sure you want to sign out of your account?</p>
          </div>
          <div class="modal-footer border-0 pt-2">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" onclick="confirmSignOut()">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('signOutModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('signOutModal'));
  modal.show();
  
  // Clean up modal after it's hidden
  document.getElementById('signOutModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * Function to confirm and execute sign out
 */
function confirmSignOut() {
  // Close the modal first
  const modal = bootstrap.Modal.getInstance(document.getElementById('signOutModal'));
  if (modal) {
    modal.hide();
  }
  
  // Sign out
  if (window.Clerk) {
    Clerk.signOut();
  }
}

/**
 * Format a user's name nicely
 */
function formatUserName(firstName, lastName) {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return "User";
  }
}

/**
 * Navigate to a user profile page
 * @param {string} username - The username to navigate to
 */
function navigateToUserProfile(username) {
  if (!username) {
    console.error('Username is required to navigate to user profile');
    return;
  }
  
  // Use the clean URL format: railhubpictures.org/users/username
  window.location.href = `/users/${username}`;
}

// Track session state to prevent redundant sign-in activities
let lastSessionId = null;
let lastActivityTimestamp = 0;
const SESSION_ACTIVITY_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

window.addEventListener("load", async () => {
  // Initialize auth buttons right away
  initAuthButtons();
  
  try {
    // Wait for Clerk to load
    await Clerk.load();
    
    // Check if we need to track this session
    if (Clerk.session) {
      const currentSessionId = Clerk.session.id;
      const currentTime = Date.now();
      const sessionStorage = window.sessionStorage;
      
      // Get last session data
      const storedSessionData = sessionStorage.getItem('railhub_session');
      let sessionData = storedSessionData ? JSON.parse(storedSessionData) : null;
      
      if (!sessionData) {
        // First time we're seeing this session
        sessionData = {
          sessionId: currentSessionId,
          lastActivity: currentTime,
          signInRecorded: false
        };
      } else if (sessionData.sessionId !== currentSessionId) {
        // New session
        sessionData = {
          sessionId: currentSessionId,
          lastActivity: currentTime,
          signInRecorded: false
        };
      }
      
      // Only record sign-in if:
      // 1. We haven't recorded it for this session, or
      // 2. It's been longer than the cooldown period
      window.shouldRecordSignIn = 
        !sessionData.signInRecorded || 
        (currentTime - sessionData.lastActivity > SESSION_ACTIVITY_COOLDOWN);
        
      // Update session data
      sessionData.lastActivity = currentTime;
      if (window.shouldRecordSignIn) {
        sessionData.signInRecorded = true;
      }
      
      // Save updated session data
      sessionStorage.setItem('railhub_session', JSON.stringify(sessionData));
      
      console.log(`Session tracking: ${window.shouldRecordSignIn ? 'Recording sign-in' : 'Skipping redundant sign-in'}`);
    }
    
    // Get the auth buttons container
    const authButtonsContainer = document.getElementById("auth-buttons");
    const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');
    const userInfo = document.getElementById("userInfo");
    
    if (Clerk.user) {
      // Get user information for display
      const firstName = Clerk.user.firstName || '';
      const lastName = Clerk.user.lastName || '';
      const displayName = formatUserName(firstName, lastName);
      const userInitials = (firstName ? firstName[0] : '') + (lastName ? lastName[0] : '');
      const userImageUrl = Clerk.user.imageUrl;
      
      // Add user-signed-in class to body for CSS targeting
      document.body.classList.add('user-signed-in');
      
      // Get notification count
      let notificationCount = 0;
      try {
        notificationCount = await fetchNotificationCount();
      } catch (error) {
        console.log('Could not fetch notification count, using default');
      }
      
      // Create notification badges for both dropdown item and avatar
      const notificationBadge = notificationCount > 0 ? 
        `<span class="badge bg-danger rounded-pill ms-2">${notificationCount}</span>` : '';
      
      // Create a position-absolute badge for the avatar
      const avatarBadge = notificationCount > 0 ? 
        `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6rem;">${notificationCount}<span class="visually-hidden">unread notifications</span></span>` : '';
      
      // Clean, minimal desktop auth UI - just avatar dropdown
      authButtonsContainer.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-link p-0 border-0 d-flex align-items-center position-relative" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            ${userImageUrl ? 
              `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle" width="32" height="32" style="object-fit: cover;">` :
              `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 14px; font-weight: 500;">${userInitials}</div>`
            }
            ${avatarBadge}
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="min-width: 200px;" aria-labelledby="userDropdown">
            <li class="dropdown-header border-bottom pb-2 mb-2">
              <div class="d-flex align-items-center">
                ${userImageUrl ? 
                  `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle me-2" width="40" height="40" style="object-fit: cover;">` :
                  `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style="width: 40px; height: 40px; font-size: 16px; font-weight: 500;">${userInitials}</div>`
                }
                <div>
                  <div class="fw-bold small">${displayName}</div>
                  <div class="text-muted" style="font-size: 12px;">${Clerk.user.emailAddresses[0]?.emailAddress || ''}</div>
                </div>
              </div>
            </li>
            <li><a class="dropdown-item py-2" href="profile.html">
              <i class="bi bi-person me-2"></i>View Profile
            </a></li>
            <li><a class="dropdown-item py-2" href="my-photos.html">
              <i class="bi bi-images me-2"></i>My Photos
            </a></li>
            <li><a class="dropdown-item py-2" href="notifications.html">
              <i class="bi bi-bell me-2"></i>Notifications
              ${notificationBadge}
            </a></li>
            <li><a class="dropdown-item py-2" href="account-settings.html">
              <i class="bi bi-gear me-2"></i>Account Settings
            </a></li>
            <li><hr class="dropdown-divider my-2"></li>
            <li><button class="dropdown-item py-2 text-danger" onclick="showSignOutModal()">
              <i class="bi bi-box-arrow-right me-2"></i>Sign Out
            </button></li>
          </ul>
        </div>
      `;
      
      // Mobile auth buttons - centered modal dropdown
      if (mobileAuthButtons) {
        mobileAuthButtons.innerHTML = `
          <button class="btn btn-link p-1 position-relative" type="button" data-bs-toggle="modal" data-bs-target="#mobileUserModal">
            ${userImageUrl ? 
              `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle" width="28" height="28" style="object-fit: cover;">` :
              `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; font-size: 12px; font-weight: 500;">${userInitials}</div>`
            }
            ${notificationCount > 0 ? 
              `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.55rem;">${notificationCount}<span class="visually-hidden">unread notifications</span></span>` : 
              ''}
          </button>
          
          <!-- Mobile User Modal -->
          <div class="modal fade" id="mobileUserModal" tabindex="-1" aria-labelledby="mobileUserModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header border-0 pb-2">
                  <div class="d-flex align-items-center">
                    ${userImageUrl ? 
                      `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle me-3" width="48" height="48" style="object-fit: cover;">` :
                      `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px; font-size: 18px; font-weight: 500;">${userInitials}</div>`
                    }
                    <div>
                      <h5 class="modal-title fw-bold mb-0" id="mobileUserModalLabel">${displayName}</h5>
                      <small class="text-muted">${Clerk.user.emailAddresses[0]?.emailAddress || ''}</small>
                    </div>
                  </div>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0">
                  <div class="list-group list-group-flush">
                    <a href="profile.html" class="list-group-item list-group-item-action border-0 py-3">
                      <i class="bi bi-person me-3"></i>View Profile
                    </a>
                    <a href="my-photos.html" class="list-group-item list-group-item-action border-0 py-3">
                      <i class="bi bi-images me-3"></i>My Photos
                    </a>
                    <a href="notifications.html" class="list-group-item list-group-item-action border-0 py-3 d-flex justify-content-between align-items-center">
                      <div><i class="bi bi-bell me-3"></i>Notifications</div>
                      ${notificationCount > 0 ? `<span class="badge bg-danger rounded-pill">${notificationCount}</span>` : ''}
                    </a>
                    <a href="account-settings.html" class="list-group-item list-group-item-action border-0 py-3">
                      <i class="bi bi-gear me-3"></i>Account Settings
                    </a>
                  </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                  <button type="button" class="btn btn-danger w-100" onclick="showSignOutModal()" data-bs-dismiss="modal">
                    <i class="bi bi-box-arrow-right me-2"></i>Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      console.log("User is signed in:", displayName);
      
      // Set up periodic notification check if user is logged in
      // Check for new notifications every 2 minutes
      const NOTIFICATION_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds
      setInterval(updateNotificationBadges, NOTIFICATION_CHECK_INTERVAL);
      
    } else {
      // User is not logged in - clean sign in/up buttons
      document.body.classList.remove('user-signed-in');
      
      authButtonsContainer.innerHTML = `
        <div class="d-flex gap-2">
          <button onclick="Clerk.openSignIn()" class="btn btn-outline-primary btn-sm px-3">
            Sign In
          </button>
          <button onclick="Clerk.openSignUp()" class="btn btn-primary btn-sm px-3">
            Sign Up
          </button>
        </div>
      `;
      
      if (mobileAuthButtons) {
        mobileAuthButtons.innerHTML = `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" onclick="Clerk.openSignIn()">Sign In</button>
            <button class="btn btn-primary btn-sm" onclick="Clerk.openSignUp()">Sign Up</button>
          </div>
        `;
      }
      
      console.log("User is not signed in");
    }
  } catch (error) {
    console.error("Error initializing Clerk:", error);
    
    // Fallback UI
    const authButtonsContainer = document.getElementById("auth-buttons");
    if (authButtonsContainer) {
      authButtonsContainer.innerHTML = `
        <div class="d-flex gap-2">
          <a href="login.html" class="btn btn-outline-primary btn-sm px-3">Sign In</a>
          <a href="register.html" class="btn btn-primary btn-sm px-3">Sign Up</a>
        </div>
      `;
    }
    console.log("Using fallback authentication links");
  }
});