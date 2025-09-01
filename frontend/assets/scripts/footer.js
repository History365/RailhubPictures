function createFooter() {
    const footer = document.createElement('footer');
    footer.style.cssText = 'background: white; border-top: 1px solid #eee; padding: 1.5rem 0; margin-top: 2rem; width: 100%;';

    const container = document.createElement('div');
    container.style.cssText = 'max-width: 1400px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: center; align-items: center;';

    const content = document.createElement('div');
    content.style.cssText = 'color: #666; display: flex; align-items: center; gap: 0.5rem;';

    content.innerHTML = 'Railhub Pictures © 2024-2025';

    const bullet1 = document.createElement('span');
    bullet1.textContent = '•';
    bullet1.style.color = '#666';
    content.appendChild(bullet1);

    const photosText = document.createElement('span');
    photosText.textContent = 'All Photos © Respective Authors';
    content.appendChild(photosText);

    const bullet2 = document.createElement('span');
    bullet2.textContent = '•';
    bullet2.style.color = '#666';
    content.appendChild(bullet2);

    const aboutLink = document.createElement('a');
    aboutLink.href = 'aboutme.html';
    aboutLink.textContent = 'About';
    aboutLink.style.cssText = 'color: #666; text-decoration: none; transition: all 0.2s;';

    content.appendChild(aboutLink);
    container.appendChild(content);
    footer.appendChild(container);

    // Add hover effect for links
    const style = document.createElement('style');
    style.textContent = `
        footer a:hover {
            color: #000 !important;
            text-decoration: underline !important;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(footer);
}

// Call createFooter when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', createFooter);
