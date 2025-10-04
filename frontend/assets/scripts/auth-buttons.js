/**
 * Initializes authentication buttons with proper styling
 */
document.addEventListener('DOMContentLoaded', function() {
    const authButtonsContainer = document.getElementById('auth-buttons');
    
    if (authButtonsContainer) {
        // Check if user is signed in (this would be replaced with actual auth check)
        const isSignedIn = false; // Replace with actual check
        
        if (!isSignedIn) {
            // Create Sign In button
            const signInButton = document.createElement('a');
            signInButton.href = '#'; // Replace with actual sign in URL/action
            signInButton.className = 'auth-button';
            signInButton.textContent = 'Sign In';
            signInButton.onclick = function(e) {
                e.preventDefault();
                // Add your sign in logic here
                console.log('Sign in clicked');
            };
            
            // Create Sign Up button
            const signUpButton = document.createElement('a');
            signUpButton.href = '#'; // Replace with actual sign up URL/action
            signUpButton.className = 'auth-button';
            signUpButton.textContent = 'Sign Up';
            signUpButton.onclick = function(e) {
                e.preventDefault();
                // Add your sign up logic here
                console.log('Sign up clicked');
            };
            
            // Add buttons to container
            authButtonsContainer.appendChild(signInButton);
            authButtonsContainer.appendChild(signUpButton);
        } else {
            // Create user menu button for signed in users
            const userMenuButton = document.createElement('a');
            userMenuButton.href = '#'; // Replace with actual user profile URL
            userMenuButton.className = 'auth-button';
            userMenuButton.textContent = 'My Account';
            
            // Add button to container
            authButtonsContainer.appendChild(userMenuButton);
        }
    }
});