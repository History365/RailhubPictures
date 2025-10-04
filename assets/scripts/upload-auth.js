// Clerk Authentication Handler for Upload Page
window.addEventListener("load", async () => {
  try {
    // Wait for Clerk to load
    await Clerk.load();
    
    // Get the auth buttons container
    const authButtonsContainer = document.getElementById("auth-buttons");
    
    // Get the upload form container and section title
    const uploadFormContainer = document.querySelector(".upload-form-container");
    const sectionTitle = document.querySelector(".section-title");
    
    if (Clerk.user) {
      // User is logged in - allow access to the form
      authButtonsContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div id="user-button"></div>
          <button onclick="Clerk.signOut()" style="color: #444; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #f5f5f5; font-size: 0.95em; border: 1px solid #eee; cursor: pointer;">Log Out</button>
        </div>
      `;
      
      // Mount the user button
      const userButtonElement = document.getElementById("user-button");
      if (userButtonElement) {
        Clerk.mountUserButton(userButtonElement, {
          userProfileMode: 'navigation',
          userProfileUrl: '/userprofile.html',
          appearance: {
            elements: {
              rootBox: {
                boxShadow: 'none'
              },
              avatarBox: {
                width: '32px',
                height: '32px'
              }
            }
          }
        });
      }
      
      // Make sure the form is visible
      if (uploadFormContainer) {
        uploadFormContainer.style.display = 'block';
        
        // Set all username fields to the logged-in user's username or email
        const usernameFields = document.querySelectorAll('input[name="username"]');
        
        // Use username if available, otherwise use first part of email
        // We're using the properties directly from Clerk.user which preserves capitalization
        const username = Clerk.user.username || 
                         Clerk.user.primaryEmailAddress?.emailAddress?.split('@')[0] || 
                         `${Clerk.user.firstName || ''}${Clerk.user.lastName || ''}`.trim() ||
                         Clerk.user.id;
        
        usernameFields.forEach(field => {
          field.value = username;
          field.readOnly = true; // Make it read-only since it's from the account
          field.style.backgroundColor = '#f5f5f5';
        });
      }
      
      // Update section title to include user name
      if (sectionTitle) {
        const h2 = sectionTitle.querySelector('h2');
        if (h2) {
          h2.textContent = `Upload a Photo`;
        }
      }
      
      console.log("User is signed in:", Clerk.user.firstName);
    } else {
      // User is not logged in - hide the form and show login prompt
      authButtonsContainer.innerHTML = `
        <button onclick="Clerk.openSignIn()" style="color: #444; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #f5f5f5; font-size: 0.95em; border: 1px solid #eee; cursor: pointer;">Log In</button>
        <button onclick="Clerk.openSignUp()" style="color: #fff; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #444; font-size: 0.95em; cursor: pointer;">Register</button>
      `;
      
      // Update section title for non-authenticated users
      if (sectionTitle) {
        const h2 = sectionTitle.querySelector('h2');
        if (h2) {
          h2.textContent = `Authentication Required`;
        }
        
        const p = sectionTitle.querySelector('p');
        if (p) {
          p.textContent = `You need to be logged in to upload photos`;
        }
      }
      
      // Hide the form and show a login required message
      if (uploadFormContainer) {
        uploadFormContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 2rem; background: #f8f8f8; border-radius: 8px; border: 1px solid #eee; max-width: 600px; margin: 2rem auto;">
            <h3 style="margin-bottom: 1rem; color: #333;">Login Required</h3>
            <p style="margin-bottom: 2rem; color: #666;">You need to be logged in to upload photos to Railhub Pictures.</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <button onclick="Clerk.openSignIn()" style="color: #444; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #f5f5f5; font-size: 0.95em; border: 1px solid #eee; cursor: pointer;">Log In</button>
              <button onclick="Clerk.openSignUp()" style="color: #fff; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #444; font-size: 0.95em; cursor: pointer;">Register</button>
            </div>
          </div>
        `;
      }
      
      console.log("User is not signed in - hiding upload form");
    }
  } catch (error) {
    console.error("Error initializing Clerk:", error);
    
    // Fallback to regular links if there's an error
    const authButtonsContainer = document.getElementById("auth-buttons");
    if (authButtonsContainer) {
      authButtonsContainer.innerHTML = `
        <a href="login.html" style="color: #444; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #f5f5f5; font-size: 0.95em; border: 1px solid #eee;">Log In</a>
        <a href="register.html" style="color: #fff; text-decoration: none; font-weight: 500; padding: 0.7em 1.4em; border-radius: 6px; background: #444; font-size: 0.95em;">Register</a>
      `;
    }
  }
});
