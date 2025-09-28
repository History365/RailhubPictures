// Enhanced Clerk Authentication Handler

/**
 * Function to confirm before signing out
 * Shows a confirmation dialog and signs out if confirmed
 */
function confirmSignOut() {
  if (confirm("Are you sure you want to sign out?")) {
    Clerk.signOut();
  }
}

/**
 * Format a user's name nicely
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @return {string} - Formatted name
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
  try {
    // Wait for Clerk to load
    await Clerk.load();
    
    // Get the auth buttons container
    const authButtonsContainer = document.getElementById("auth-buttons");
    const userInfo = document.getElementById("userInfo");
    const mobileMenuUserSection = document.querySelector('.mobile-menu-user-section');
    
    if (Clerk.user) {
      // Check if user is the owner
      const isOwner = Clerk.user.id === "user_321PdlXuM1MAAu1uTGsNHiw8B4X"; // Replace with your actual owner ID
      
      // Get user information for display
      const firstName = Clerk.user.firstName || '';
      const lastName = Clerk.user.lastName || '';
      const displayName = formatUserName(firstName, lastName);
      const userInitials = (firstName ? firstName[0] : '') + (lastName ? lastName[0] : '');
      const userImageUrl = Clerk.user.imageUrl;
      
      // Add user-signed-in class to body for CSS targeting
      document.body.classList.add('user-signed-in');
      
      // Update desktop auth buttons with enhanced dropdown
      authButtonsContainer.innerHTML = `
        <div class="dropdown user-dropdown">
          <button class="btn btn-link text-decoration-none text-dark d-flex align-items-center avatar-button" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            ${userImageUrl ? 
              `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle user-avatar" width="36" height="36">` :
              `<div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center user-avatar" style="width: 36px; height: 36px; font-size: 15px;">${userInitials}</div>`
            }
            <span class="d-none d-lg-inline ms-2 me-1 user-name">${displayName}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ms-1 dropdown-caret">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 user-dropdown-menu py-0" aria-labelledby="userDropdown">
            <!-- User header with avatar -->
            <li class="dropdown-header d-flex p-3 align-items-center bg-light border-bottom">
              ${userImageUrl ? 
                `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle me-3" width="48" height="48">` :
                `<div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px; font-size: 18px;">${userInitials}</div>`
              }
              <div>
                <h6 class="mb-0 fw-bold">${displayName}</h6>
                <small class="text-muted">${Clerk.user.emailAddresses[0]?.emailAddress || ''}</small>
              </div>
            </li>
            
            <!-- User content section -->
            <div class="py-1">
              <li><a class="dropdown-item d-flex align-items-center py-2" href="userprofile.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>View Profile</span>
              </a></li>
              <li><a class="dropdown-item d-flex align-items-center py-2" href="my-photos.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>My Photos</span>
              </a></li>
              <li><a class="dropdown-item d-flex align-items-center py-2" href="upload.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Upload Photos</span>
              </a></li>
              <li><a class="dropdown-item d-flex align-items-center py-2" href="notifications.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Notifications</span>
                <span class="badge bg-danger rounded-pill ms-auto">3</span>
              </a></li>
            </div>
            
            <!-- Account Settings Section -->
            <div class="border-top py-1">
              <li><a class="dropdown-item d-flex align-items-center py-2" href="account-settings.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Account Settings</span>
              </a></li>
              <li><a class="dropdown-item d-flex align-items-center py-2" href="favorites.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>Saved Photos</span>
              </a></li>
            </div>
            
            <!-- Admin section (conditional) -->
            ${isOwner ? `
            <div class="border-top py-1">
              <li><a class="dropdown-item d-flex align-items-center py-2" href="admin.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span>Admin Dashboard</span>
              </a></li>
              <li><a class="dropdown-item d-flex align-items-center py-2" href="site-settings.html">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>Site Settings</span>
              </a></li>
            </div>
            ` : ''}
            
            <!-- Sign out option -->
            <div class="border-top py-1">
              <li><button class="dropdown-item d-flex align-items-center py-2 text-danger" onclick="confirmSignOut()">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sign Out</span>
              </button></li>
            </div>
          </ul>
        </div>
      `;
      
      // Update mobile menu user section if it exists
      if (mobileMenuUserSection) {
        mobileMenuUserSection.innerHTML = `
          <div class="p-3 bg-light rounded-3 mb-3">
            <div class="d-flex align-items-center mb-3 border-bottom pb-3">
              ${userImageUrl ? 
                `<img src="${userImageUrl}" alt="${displayName}" class="rounded-circle me-3" width="48" height="48">` :
                `<div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" style="width: 48px; height: 48px; font-size: 18px;">${userInitials}</div>`
              }
              <div>
                <h6 class="mb-0 fw-bold">${displayName}</h6>
                <small class="text-muted">${Clerk.user.emailAddresses[0]?.emailAddress || ''}</small>
              </div>
            </div>
            
            <!-- User Action Items -->
            <div class="d-flex flex-column gap-2 mb-3">
              <a href="userprofile.html" class="mobile-menu-item d-flex align-items-center text-decoration-none text-body py-2">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>View Profile</span>
              </a>
              
              <a href="my-photos.html" class="mobile-menu-item d-flex align-items-center text-decoration-none text-body py-2">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>My Photos</span>
              </a>
              
              <a href="upload.html" class="mobile-menu-item d-flex align-items-center text-decoration-none text-body py-2">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Upload Photos</span>
              </a>
              
              <a href="notifications.html" class="mobile-menu-item d-flex align-items-center text-decoration-none text-body py-2 justify-content-between">
                <div class="d-flex align-items-center">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>Notifications</span>
                </div>
                <span class="badge bg-danger rounded-pill">3</span>
              </a>
              
              <a href="account-settings.html" class="mobile-menu-item d-flex align-items-center text-decoration-none text-body py-2">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Account Settings</span>
              </a>
              
              <!-- Admin links if user is owner -->
              ${isOwner ? `
              <a href="admin.html" class="mobile-menu-item d-flex align-items-center text-decoration-none text-body py-2">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span>Admin Dashboard</span>
              </a>
              ` : ''}
            </div>
            
            <!-- Sign Out Button -->
            <div class="pt-2 border-top">
              <button onclick="confirmSignOut()" class="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 mt-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        `;
      }
      
      // Mount the user button
      const userButtonElement = document.getElementById("user-button");
      if (userButtonElement) {
        Clerk.mountUserButton(userButtonElement, {
          userProfileMode: 'navigation',
          userProfileUrl: '/userprofile.html',
          appearance: {
            elements: {
              rootBox: {
                boxShadow: 'none',
                width: 'auto'
              },
              avatarBox: {
                width: '32px',
                height: '32px'
              }
            }
          }
        });
      }
      
      // Log user info and update userInfo element if it exists
      console.log("User is signed in:", Clerk.user.firstName);
      
      // Don't display welcome message to reduce clutter
      if (userInfo) {
        userInfo.innerHTML = ``;
      }
    } else {
      // User is not logged in
      document.body.classList.remove('user-signed-in');
      
      // Desktop auth buttons - Bootstrap styled
      authButtonsContainer.innerHTML = `
        <div class="d-flex gap-2">
          <button onclick="Clerk.openSignIn()" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" title="Log In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span class="d-none d-md-inline">Log In</span>
          </button>
          <button onclick="Clerk.openSignUp()" class="btn btn-dark btn-sm d-flex align-items-center gap-2" title="Register">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span class="d-none d-md-inline">Sign Up</span>
          </button>
        </div>
      `;
      
      // Update mobile menu user section for logged out users
      if (mobileMenuUserSection) {
        mobileMenuUserSection.innerHTML = `
          <div class="p-3 bg-light rounded-3 mb-3">
            <h6 class="mb-3 text-center">Join Railhub Pictures</h6>
            <div class="d-flex flex-column gap-2">
              <button onclick="Clerk.openSignIn()" class="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Log In
            </button>
            <button onclick="Clerk.openSignUp()" class="btn btn-dark d-flex align-items-center justify-content-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Sign Up
            </button>
          </div>
        `;
      }
      
      console.log("User is not signed in");
    }
  } catch (error) {
    console.error("Error initializing Clerk:", error);
    
    // Fallback to regular links if there's an error
    const authButtonsContainer = document.getElementById("auth-buttons");
    if (authButtonsContainer) {
      authButtonsContainer.innerHTML = `
        <div class="d-flex gap-2">
          <a href="login.html" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" title="Log In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span class="d-none d-md-inline">Log In</span>
          </a>
          <a href="register.html" class="btn btn-dark btn-sm d-flex align-items-center gap-2" title="Register">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span class="d-none d-md-inline">Sign Up</span>
          </a>
        </div>
      `;
      
      // Update mobile menu for fallback as well
      const mobileMenuUserSection = document.querySelector('.mobile-menu-user-section');
      if (mobileMenuUserSection) {
        mobileMenuUserSection.innerHTML = `
          <div class="p-3 bg-light rounded-3 mb-3">
            <h6 class="mb-3 text-center">Join Railhub Pictures</h6>
            <div class="d-flex flex-column gap-2">
              <a href="login.html" class="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Log In
              </a>
              <a href="register.html" class="btn btn-dark d-flex align-items-center justify-content-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Sign Up
              </a>
            </div>
          </div>
        `;
      }
      console.log("Using fallback authentication links");
    }
  }
});