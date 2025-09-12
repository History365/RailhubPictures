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

    // Create content for left side
    const content = document.createElement('div');
    content.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';
    
    // Copyright text
    const currentYear = new Date().getFullYear();
    content.innerHTML = `Railhub Pictures © 2024-${currentYear}`;

    // Bullet point
    const bullet1 = document.createElement('span');
    bullet1.textContent = '•';
    content.appendChild(bullet1);

    // Photos copyright
    const photosText = document.createElement('span');
    photosText.textContent = 'All Photos © Respective Authors';
    content.appendChild(photosText);

    // Create right side with links and theme toggle
    const rightSide = document.createElement('div');
    rightSide.style.cssText = 'display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;';

    // About link
    const aboutLink = document.createElement('a');
    aboutLink.href = 'aboutme.html';
    aboutLink.textContent = 'About';
    aboutLink.style.cssText = 'text-decoration: none; transition: all 0.2s; color: var(--footer-text, #666);';
    rightSide.appendChild(aboutLink);

    // Privacy Policy link
    const privacyLink = document.createElement('a');
    privacyLink.href = 'privacyPolicy.html';
    privacyLink.textContent = 'Privacy Policy';
    privacyLink.style.cssText = 'text-decoration: none; transition: all 0.2s; color: var(--footer-text, #666);';
    rightSide.appendChild(privacyLink);

    // Terms of Service link
    const tosLink = document.createElement('a');
    tosLink.href = 'termsOfService.html';
    tosLink.textContent = 'Terms of Service';
    tosLink.style.cssText = 'text-decoration: none; transition: all 0.2s; color: var(--footer-text, #666);';
    rightSide.appendChild(tosLink);

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
    
    themeToggle.appendChild(moonIcon);
    themeToggle.appendChild(sunIcon);
    rightSide.appendChild(themeToggle);

    // Append everything to the DOM
    container.appendChild(content);
    container.appendChild(rightSide);
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
    
    // Only show moon icon by default
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    
    if (moonIcon) moonIcon.style.display = 'block';
    if (sunIcon) sunIcon.style.display = 'none';
    
    themeToggle.addEventListener('click', function() {
        console.log('Theme toggle clicked - functionality coming soon');
        // You can add your new theme toggle code here in the future
    });
}

// Initialize everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    createFooter();
    setupThemeToggle();
});
