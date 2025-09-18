// User Profile Handler
window.addEventListener("load", async () => {
  try {
    // Wait for Clerk to load
    await Clerk.load();
    
    // Mount the user button if the element exists
    const userButtonElement = document.getElementById("user-button");
    if (userButtonElement) {
      Clerk.mountUserButton(userButtonElement, {
        userProfileMode: 'navigation',
        userProfileUrl: '/userprofile.html',
        appearance: {
          elements: {
            rootBox: {
              boxShadow: 'none'
            }
          }
        }
      });
    }
    
  } catch (error) {
    console.error("Error initializing user profile:", error);
  }
});
