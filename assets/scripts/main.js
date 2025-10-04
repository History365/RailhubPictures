/**
 * Main JavaScript loader for Railhub Pictures
 * This file centralizes the loading of all required JavaScript files
 */

// Define the base paths for script directories
const BASE_PATH = '/assets/scripts';
const CLOUDFLARE_PATH = `${BASE_PATH}/cloudflare`;

// Utility function to dynamically load scripts
function loadScript(src, async = false, defer = false) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.defer = defer;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        
        document.head.appendChild(script);
    });
}

// Load core scripts
async function loadCoreScripts() {
    try {
        // Load API and core utilities first
        await loadScript(`${BASE_PATH}/api-loader.js`);
        
        // Load Cloudflare integration scripts
        await Promise.all([
            loadScript(`${CLOUDFLARE_PATH}/clerk-integration.js`),
            loadScript(`${CLOUDFLARE_PATH}/photo-display.js`),
            loadScript(`${CLOUDFLARE_PATH}/cloudflare-integration.js`)
        ]);
        
        // Load authentication script after Clerk integration
        await loadScript(`${BASE_PATH}/clerk-auth.js`);
        
        // Load the footer script (with defer to not block page rendering)
        loadScript(`${BASE_PATH}/footer.js`, false, true);
        
        console.log('All core scripts loaded successfully');
    } catch (error) {
        console.error('Error loading core scripts:', error);
    }
}

// Load page-specific scripts based on current page
function loadPageSpecificScripts() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'notifications.html':
            loadScript(`${BASE_PATH}/notifications.js`);
            break;
        case 'upload.html':
            loadScript(`${BASE_PATH}/upload.js`);
            break;
        case 'profile.html':
            loadScript(`${BASE_PATH}/profile.js`);
            break;
        // Add more cases for other pages as needed
    }
}

// Load Clerk SDK separately (it needs special attributes)
function loadClerkSDK() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = "anonymous";
        script.setAttribute('data-clerk-publishable-key', 'pk_test_Y29tbXVuYWwtY2F0LTI1LmNsZXJrLmFjY291bnRzLmRldiQ');
        script.src = "https://communal-cat-25.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js";
        script.type = "text/javascript";
        
        script.onload = () => resolve();
        script.onerror = () => {
            console.error('Failed to load Clerk SDK');
            resolve(); // Resolve anyway to not block other scripts
        };
        
        document.head.appendChild(script);
    });
}

// Initialize all scripts
async function initializeScripts() {
    try {
        // First load Clerk SDK
        await loadClerkSDK();
        
        // Then load core scripts
        await loadCoreScripts();
        
        // Finally load page-specific scripts
        loadPageSpecificScripts();
    } catch (error) {
        console.error('Error initializing scripts:', error);
    }
}

// Start loading scripts when DOM is ready
document.addEventListener('DOMContentLoaded', initializeScripts);