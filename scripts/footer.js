function createFooter() {
    // Create footer element
    const footer = document.createElement('footer');
    footer.style.cssText = `background-color: var(--footer-bg, #f8f8f8); 
                           color: var(--footer-text, #666); 
                           border-top: 1px solid var(--border-color, #eee); 
                           padding: 1.5rem 0; 
                           margin-top: 2rem; 
                           width: 100%;`;
    footer.className = 'site-footer';

    // Create container
    const container = document.createElement('div');
    container.style.cssText = 'max-width: 1400px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;';

    // Create left column (copyright info)
    const leftCol = document.createElement('div');
    leftCol.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; flex: 1;';
    
    // Copyright text
    const currentYear = new Date().getFullYear();
    leftCol.innerHTML = `Railhub Pictures © 2024-${currentYear}`;

    // Bullet point
    const bullet1 = document.createElement('span');
    bullet1.textContent = '•';
    leftCol.appendChild(bullet1);

    // Photos copyright
    const photosText = document.createElement('span');
    photosText.textContent = 'All Photos © Respective Authors';
    leftCol.appendChild(photosText);

    // Create middle column (theme toggle)
    const middleCol = document.createElement('div');
    middleCol.style.cssText = 'display: flex; align-items: center; justify-content: center; padding: 0 1rem;';
    
    // Theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    
    // Moon icon (for light mode)
    const moonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    moonIcon.classList.add('moon-icon');
    moonIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    moonIcon.setAttribute('width', '20');
    moonIcon.setAttribute('height', '20');
    moonIcon.setAttribute('viewBox', '0 0 24 24');
    moonIcon.setAttribute('fill', 'none');
    moonIcon.setAttribute('stroke', 'currentColor');
    moonIcon.setAttribute('stroke-width', '2');
    moonIcon.setAttribute('stroke-linecap', 'round');
    moonIcon.setAttribute('stroke-linejoin', 'round');
    const moonPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    moonPath.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    moonIcon.appendChild(moonPath);
    
    // Sun icon (for dark mode)
    const sunIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sunIcon.classList.add('sun-icon');
    sunIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    sunIcon.setAttribute('width', '20');
    sunIcon.setAttribute('height', '20');
    sunIcon.setAttribute('viewBox', '0 0 24 24');
    sunIcon.setAttribute('fill', 'none');
    sunIcon.setAttribute('stroke', 'currentColor');
    sunIcon.setAttribute('stroke-width', '2');
    sunIcon.setAttribute('stroke-linecap', 'round');
    sunIcon.setAttribute('stroke-linejoin', 'round');
    
    // Create all the sun icon elements
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '5');
    sunIcon.appendChild(circle);
    
    const lines = [
        { x1: '12', y1: '1', x2: '12', y2: '3' },
        { x1: '12', y1: '21', x2: '12', y2: '23' },
        { x1: '4.22', y1: '4.22', x2: '5.64', y2: '5.64' },
        { x1: '18.36', y1: '18.36', x2: '19.78', y2: '19.78' },
        { x1: '1', y1: '12', x2: '3', y2: '12' },
        { x1: '21', y1: '12', x2: '23', y2: '12' },
        { x1: '4.22', y1: '19.78', x2: '5.64', y2: '18.36' },
        { x1: '18.36', y1: '5.64', x2: '19.78', y2: '4.22' }
    ];
    
    lines.forEach(lineAttrs => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', lineAttrs.x1);
        line.setAttribute('y1', lineAttrs.y1);
        line.setAttribute('x2', lineAttrs.x2);
        line.setAttribute('y2', lineAttrs.y2);
        sunIcon.appendChild(line);
    });
    
    // Add theme label
    const themeLabel = document.createElement('span');
    themeLabel.className = 'theme-label';
    themeLabel.textContent = 'Light Mode';
    themeLabel.style.cssText = 'margin-left: 0.5rem; font-size: 0.9rem;';
    
    // Append icons and label to toggle button
    themeToggle.appendChild(moonIcon);
    themeToggle.appendChild(sunIcon);
    themeToggle.appendChild(themeLabel);
    
    // Style the button
    themeToggle.style.cssText = 'border: none; background: transparent; cursor: pointer; padding: 0.5rem; display: flex; align-items: center; justify-content: center; color: var(--footer-text, #666);';
    
    middleCol.appendChild(themeToggle);

    // Create right side with links
    const rightCol = document.createElement('div');
    rightCol.style.cssText = 'display: flex; align-items: center; gap: 1rem; justify-content: flex-end; flex: 1;';

    // Privacy Policy link
    const privacyLink = document.createElement('a');
    privacyLink.href = 'privacyPolicy.html';
    privacyLink.textContent = 'Privacy Policy';
    privacyLink.style.cssText = 'text-decoration: none; transition: all 0.2s; color: var(--footer-text, #666);';
    rightCol.appendChild(privacyLink);

    // Terms of Service link
    const tosLink = document.createElement('a');
    tosLink.href = 'termsOfService.html';
    tosLink.textContent = 'Terms of Service';
    tosLink.style.cssText = 'text-decoration: none; transition: all 0.2s; color: var(--footer-text, #666);';
    rightCol.appendChild(tosLink);

    // Append everything to the DOM
    container.appendChild(leftCol);
    container.appendChild(middleCol);
    container.appendChild(rightCol);
    footer.appendChild(container);
    document.body.appendChild(footer);
}

/**
 * Set up event listeners for theme toggle button
 * Currently a placeholder for future functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const htmlElement = document.documentElement;
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    
    // Get current theme from data-bs-theme attribute or localStorage
    const currentTheme = htmlElement.getAttribute('data-bs-theme') || 
                         localStorage.getItem('theme') || 
                         'light';
    
    // Set initial icon state
    if (currentTheme === 'dark') {
        if (moonIcon) moonIcon.style.display = 'none';
        if (sunIcon) sunIcon.style.display = 'block';
    } else {
        if (moonIcon) moonIcon.style.display = 'block';
        if (sunIcon) sunIcon.style.display = 'none';
    }
    
    // Create theme selector dropdown
    const themeSelector = document.createElement('div');
    themeSelector.className = 'theme-selector';
    themeSelector.style.cssText = `
        position: fixed;
        background-color: var(--footer-bg, #fff);
        border: 1px solid var(--border-color, #eee);
        border-radius: 0.5rem;
        box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.15);
        padding: 0.5rem;
        display: none;
        z-index: 1050;
        margin-bottom: 0.5rem;
    `;
    
    // Create theme options - remove the 'auto' option as requested
    const themes = [
        { id: 'light', icon: '☀️', label: 'Light Mode' },
        { id: 'dark', icon: '🌙', label: 'Dark Mode' }
    ];
    
    themes.forEach(theme => {
        const option = document.createElement('div');
        option.className = 'theme-option';
        option.setAttribute('data-theme', theme.id);
        option.style.cssText = `
            padding: 0.5rem 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            border-radius: 0.25rem;
            white-space: nowrap;
            transition: background-color 0.2s;
            color: var(--footer-text, #666);
        `;
        option.innerHTML = `
            <span style="margin-right: 0.5rem; font-size: 1rem;">${theme.icon}</span>
            <span>${theme.label}</span>
        `;
        
        // Highlight active theme
        if ((theme.id === 'light' && (currentTheme === 'light' || !currentTheme)) ||
            (theme.id === 'dark' && currentTheme === 'dark')) {
            option.style.fontWeight = 'bold';
            option.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        }
        
        // Hover effect
        option.addEventListener('mouseover', () => {
            option.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        });
        
        option.addEventListener('mouseout', () => {
            if (!((theme.id === 'light' && (currentTheme === 'light' || !currentTheme)) ||
                (theme.id === 'dark' && currentTheme === 'dark'))) {
                option.style.backgroundColor = 'transparent';
            }
        });
        
        // Click handler
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            applyTheme(theme.id);
            
            // Update highlighted option
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.style.fontWeight = 'normal';
                opt.style.backgroundColor = 'transparent';
            });
            option.style.fontWeight = 'bold';
            option.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            
            themeSelector.style.display = 'none';
        });
        
        themeSelector.appendChild(option);
    });
    
    // Append the selector to the body for better positioning
    document.body.appendChild(themeSelector);
    
    // Function to apply a theme
    function applyTheme(themeId) {
        // Update theme
        htmlElement.setAttribute('data-bs-theme', themeId);
        localStorage.setItem('theme', themeId);
        
        // Toggle icon display
        if (themeId === 'dark') {
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIcon) sunIcon.style.display = 'block';
        } else {
            if (moonIcon) moonIcon.style.display = 'block';
            if (sunIcon) sunIcon.style.display = 'none';
        }
        
        // Update CSS variables for footer
        if (themeId === 'dark') {
            document.documentElement.style.setProperty('--footer-bg', '#212529');
            document.documentElement.style.setProperty('--footer-text', '#e9ecef');
            document.documentElement.style.setProperty('--border-color', '#495057');
        } else {
            document.documentElement.style.setProperty('--footer-bg', '#f8f8f8');
            document.documentElement.style.setProperty('--footer-text', '#666');
            document.documentElement.style.setProperty('--border-color', '#eee');
        }
        
        // Update theme name in the page's theme button if it exists
        const themeNameElement = document.querySelector('.theme-name');
        if (themeNameElement) {
            themeNameElement.textContent = themeId === 'dark' ? 'Dark Mode' : 'Light Mode';
        }
        
        // Update any theme buttons in the page if they exist
        const lightThemeBtn = document.getElementById('lightThemeBtn');
        const darkThemeBtn = document.getElementById('darkThemeBtn');
        const systemThemeBtn = document.getElementById('systemThemeBtn');
        
        if (lightThemeBtn && darkThemeBtn && systemThemeBtn) {
            // Remove active classes
            lightThemeBtn.classList.remove('active', 'btn-secondary');
            darkThemeBtn.classList.remove('active', 'btn-secondary');
            systemThemeBtn.classList.remove('active', 'btn-secondary');
            
            // Add outline classes
            lightThemeBtn.classList.add('btn-outline-secondary');
            darkThemeBtn.classList.add('btn-outline-secondary');
            systemThemeBtn.classList.add('btn-outline-secondary');
            
            // Add active class to selected button based on the theme ID (not effective theme)
            if (themeId === 'light') {
                lightThemeBtn.classList.remove('btn-outline-secondary');
                lightThemeBtn.classList.add('active', 'btn-secondary');
            } else if (themeId === 'dark') {
                darkThemeBtn.classList.remove('btn-outline-secondary');
                darkThemeBtn.classList.add('active', 'btn-secondary');
            } else {
                systemThemeBtn.classList.remove('btn-outline-secondary');
                systemThemeBtn.classList.add('active', 'btn-secondary');
            }
        }
    }
    
    // Position the dropdown when toggle is clicked
    themeToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Get position of the toggle button
        const toggleRect = themeToggle.getBoundingClientRect();
        
        // Toggle display
        if (themeSelector.style.display === 'block') {
            themeSelector.style.display = 'none';
        } else {
            // Position above the button, but check if there's enough space
            const spaceAbove = toggleRect.top;
            const selectorHeight = 100; // Approximate height
            
            if (spaceAbove >= selectorHeight) {
                // Position above
                themeSelector.style.bottom = (window.innerHeight - toggleRect.top + 5) + 'px';
                themeSelector.style.top = 'auto';
            } else {
                // Position below
                themeSelector.style.top = (toggleRect.bottom + 5) + 'px';
                themeSelector.style.bottom = 'auto';
            }
            
            // Position horizontally
            themeSelector.style.left = Math.max(5, toggleRect.left - 80) + 'px'; // Center, but ensure it's visible
            
            // Show the selector
            themeSelector.style.display = 'block';
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        themeSelector.style.display = 'none';
    });
    
    // If system theme changes, update if in auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'auto') {
            htmlElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light');
            
            // Update icon
            if (e.matches) {
                if (moonIcon) moonIcon.style.display = 'none';
                if (sunIcon) sunIcon.style.display = 'block';
            } else {
                if (moonIcon) moonIcon.style.display = 'block';
                if (sunIcon) sunIcon.style.display = 'none';
            }
            
            // Update CSS variables for footer
            if (e.matches) {
                document.documentElement.style.setProperty('--footer-bg', '#212529');
                document.documentElement.style.setProperty('--footer-text', '#e9ecef');
                document.documentElement.style.setProperty('--border-color', '#495057');
            } else {
                document.documentElement.style.setProperty('--footer-bg', '#f8f8f8');
                document.documentElement.style.setProperty('--footer-text', '#666');
                document.documentElement.style.setProperty('--border-color', '#eee');
            }
        }
    });
}

// Initialize everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    createFooter();
    setupThemeToggle();
});
