/**
 * RailHub API Loader
 * 
 * This script detects if emergency mode is enabled and loads the appropriate API client.
 * Include this script before any other scripts that depend on the API.
 */

(function() {
    // Check if emergency mode is enabled in localStorage
    const emergencyMode = localStorage.getItem('railhub_emergency_mode') === 'true';
    
    // Log emergency mode status
    console.log(`RailHub API Loader: Emergency mode is ${emergencyMode ? 'ENABLED' : 'disabled'}`);
    
    // Load appropriate API client script
    const scriptElement = document.createElement('script');
    
    if (emergencyMode) {
        scriptElement.src = '/assets/scripts/cloudflare/emergency-api-client.js';
        scriptElement.onload = function() {
            console.log('Emergency API client loaded successfully');
            window.railhubAPI = new EmergencyRailHubAPI();
            
            // Dispatch event to notify other scripts that API is ready
            window.dispatchEvent(new CustomEvent('railhub-api-ready', { 
                detail: { emergency: true }
            }));
        };
    } else {
        // Load the regular API client
        scriptElement.src = '/assets/scripts/api-client.js';
        scriptElement.onload = function() {
            console.log('Standard API client loaded successfully');
            
            // Initialize the API client
            window.railhubAPI = new RailHubAPI();
            
            // Detect best endpoint and initialize
            window.railhubAPI.detectBestEndpoint()
                .then(endpoint => {
                    console.log('Best API endpoint detected:', endpoint);
                    
                    // Dispatch event to notify other scripts that API is ready
                    window.dispatchEvent(new CustomEvent('railhub-api-ready', { 
                        detail: { emergency: false }
                    }));
                })
                .catch(error => {
                    console.error('Error detecting best API endpoint:', error);
                    
                    // Show warning about API issues
                    const warning = document.createElement('div');
                    warning.style.backgroundColor = '#fff3cd';
                    warning.style.color = '#856404';
                    warning.style.padding = '10px';
                    warning.style.margin = '10px 0';
                    warning.style.borderRadius = '4px';
                    warning.style.textAlign = 'center';
                    warning.innerHTML = `
                        <strong>Warning:</strong> API connection issues detected. 
                        <a href="/api-emergency.html" style="color: #856404; font-weight: bold;">
                            Enable emergency mode
                        </a>
                    `;
                    document.body.insertBefore(warning, document.body.firstChild);
                    
                    // Try to continue anyway
                    window.dispatchEvent(new CustomEvent('railhub-api-ready', { 
                        detail: { emergency: false, error: error }
                    }));
                });
        };
    }
    
    scriptElement.onerror = function() {
        console.error(`Failed to load ${emergencyMode ? 'emergency' : 'standard'} API client`);
        
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.style.backgroundColor = '#f8d7da';
        errorElement.style.color = '#721c24';
        errorElement.style.padding = '10px';
        errorElement.style.margin = '10px 0';
        errorElement.style.borderRadius = '4px';
        errorElement.style.textAlign = 'center';
        errorElement.innerHTML = `
            <strong>Error:</strong> Failed to load API client. 
            <a href="/api-emergency.html" style="color: #721c24; font-weight: bold;">
                Try emergency mode
            </a>
        `;
        
        // Add to page if body exists
        if (document.body) {
            document.body.insertBefore(errorElement, document.body.firstChild);
        } else {
            // If body doesn't exist yet, wait for it
            document.addEventListener('DOMContentLoaded', function() {
                document.body.insertBefore(errorElement, document.body.firstChild);
            });
        }
    };
    
    // Add the script to the document
    document.head.appendChild(scriptElement);
})();
