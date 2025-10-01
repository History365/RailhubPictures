// Enhanced Clerk Authentication Handler

/**
 * API Configuration
 */
const API_BASE_URL = 'https://railhubpictures.org'; // Updated to use main domain without /api path

/**
 * Get the current user's session token for API calls
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
 * Make authenticated API request
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
  
  // Add user_id as query parameter for development/testing
  // Make sure endpoint starts with /api/ for proper routing
  const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const url = new URL(`${API_BASE_URL}${apiEndpoint}`);
  
  console.log('Making authenticated request to:', url.toString());
  console.log('Authorization header present:', !!token);
  
  if (window.Clerk && Clerk.user && token) {
    url.searchParams.set('user_id', Clerk.user.id);
    console.log('Added user_id param:', Clerk.user.id);
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
 * Fetch user profile data
 */
async function fetchUserProfile() {
  try {
    const profile = await makeAuthenticatedRequest('/api/profile');
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
 */
async function fetchNotificationCount() {
  try {
    // First check if the user is authenticated
    if (!Clerk || !Clerk.user) {
      console.log('Clerk user not available for notifications');
      return 0;
    }
    
    console.log('Fetching notifications for', Clerk.user.id);
    
    // Make the API request with error handling
    try {
      // Debug test endpoint first
      console.log('Testing debug endpoint first...');
      try {
        const debugResult = await makeAuthenticatedRequest('/api/debug', { method: 'GET' });
        console.log('Debug endpoint response:', debugResult);
      } catch (debugError) {
        console.error('Debug endpoint error:', debugError);
      }
      
      // Try to get user profile first to ensure it exists
      console.log('Fetching user profile...');
      try {
        const profile = await makeAuthenticatedRequest('/api/profile', { method: 'GET' });
        console.log('Profile response:', profile);
      } catch (profileError) {
        console.error('Profile error:', profileError);
        
        // Try with debug bypass
        console.log('Trying with debug bypass...');
        try {
          const debugProfile = await makeAuthenticatedRequest('/api/profile?debug_auth=true', { method: 'GET' });
          console.log('Debug profile response:', debugProfile);
        } catch (bypassError) {
          console.error('Debug bypass error:', bypassError);
        }
      }
      
      const result = await makeAuthenticatedRequest('/api/notifications?limit=1');
      console.log('Notification response:', result);
      return result.unread_count || 0;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      // Don't show notifications if there's an API error
      return 0;
    }
  } catch (error) {
    console.error('Error in notification handling:', error);
    return 0;
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

window.addEventListener("load", async () => {
  // Initialize auth buttons right away
  initAuthButtons();
  
  try {
    // Wait for Clerk to load
    await Clerk.load();
    
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
      
      const notificationBadge = notificationCount > 0 ? 
        `<span class="badge bg-danger rounded-pill ms-2">${notificationCount}</span>` : '';
      
      // Clean, minimal desktop auth UI - just avatar dropdown
      authButtonsContainer.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-link p-0 border-0 d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            ${userImageUrl ? 
              `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle" width="32" height="32" style="object-fit: cover;">` :
              `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 14px; font-weight: 500;">${userInitials}</div>`
            }
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
          <button class="btn btn-link p-1" type="button" data-bs-toggle="modal" data-bs-target="#mobileUserModal">
            ${userImageUrl ? 
              `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle" width="28" height="28" style="object-fit: cover;">` :
              `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; font-size: 12px; font-weight: 500;">${userInitials}</div>`
            }
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