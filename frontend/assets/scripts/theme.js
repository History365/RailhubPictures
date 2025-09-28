/**
 * Theme Management System for Railhub Pictures
 * Handles theme switching and persistence across the site
 */

// Initialize the theme management system when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initThemeSystem();
});

// Initialize as early as possible to prevent flash of wrong theme
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
})();

/**
 * Main function to initialize the theme system
 */
function initThemeSystem() {
    // Get current theme from localStorage or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the current theme
    setTheme(currentTheme);
    
    // Listen for theme change events
    window.addEventListener('theme-change', function(e) {
        if (e.detail && (e.detail.theme === 'light' || e.detail.theme === 'dark')) {
            setTheme(e.detail.theme);
        }
    });
    
    // Handle system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'auto') {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Set the theme for the entire website
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
    // Update the HTML attribute
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // Store the preference
    localStorage.setItem('theme', theme);
    
    // Update CSS variables for styling consistency
    updateCSSVariables(theme);
    
    // Dispatch event to notify other components
    dispatchThemeChangeEvent(theme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
}

/**
 * Update CSS variables based on theme
 * @param {string} theme - 'light' or 'dark'
 */
function updateCSSVariables(theme) {
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--footer-bg', '#212529');
        document.documentElement.style.setProperty('--footer-text', '#e9ecef');
        document.documentElement.style.setProperty('--border-color', '#495057');
        document.documentElement.style.setProperty('--body-bg', '#212529');
        document.documentElement.style.setProperty('--body-color', '#e9ecef');
        document.documentElement.style.setProperty('--card-bg', '#343a40');
        document.documentElement.style.setProperty('--header-bg', '#212529');
    } else {
        document.documentElement.style.setProperty('--footer-bg', '#f8f8f8');
        document.documentElement.style.setProperty('--footer-text', '#666');
        document.documentElement.style.setProperty('--border-color', '#eee');
        document.documentElement.style.setProperty('--body-bg', '#ffffff');
        document.documentElement.style.setProperty('--body-color', '#333');
        document.documentElement.style.setProperty('--card-bg', '#f8f9fa');
        document.documentElement.style.setProperty('--header-bg', '#ffffff');
    }
}

/**
 * Dispatch custom event when theme changes
 * @param {string} theme - The new theme
 */
function dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('theme-change', {
        detail: { theme: theme }
    });
    window.dispatchEvent(event);
}

/**
 * Public API for the theme system
 */
window.ThemeSystem = {
    setTheme: setTheme,
    toggleTheme: toggleTheme,
    getCurrentTheme: function() {
        return document.documentElement.getAttribute('data-bs-theme') || 'light';
    }
};