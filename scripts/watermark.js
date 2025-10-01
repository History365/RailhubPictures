// Watermark functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle image preview and watermark
    const photoInput = document.getElementById('photo');
    const previewContainer = document.getElementById('photo-preview-container');
    const watermarkNotice = document.getElementById('watermark-notice');
    
    // Watermark tab elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const watermarkOptions = document.getElementById('watermark-options');
    
    // Default tab
    let currentTab = 'text'; // Set default to text watermark
    
    // Text watermark options
    const textOpacity = document.getElementById('text-opacity');
    const textOpacityValue = document.getElementById('text-opacity-value');
    const textSize = document.getElementById('text-size');
    const textSizeValue = document.getElementById('text-size-value');
    const textColor = document.getElementById('text-color');
    const textPosition = document.getElementById('text-position');
    
    // Bar watermark options
    const barHeight = document.getElementById('bar-height');
    const barHeightValue = document.getElementById('bar-height-value');
    const barOpacity = document.getElementById('bar-opacity');
    const barOpacityValue = document.getElementById('bar-opacity-value');
    const barTextColor = document.getElementById('bar-text-color');
    const barTextSize = document.getElementById('bar-text-size');
    const barTextSizeValue = document.getElementById('bar-text-size-value');
    const barTextPosition = document.getElementById('bar-text-position');
    
    // Update value displays
    textOpacity.addEventListener('input', function() {
        textOpacityValue.textContent = this.value + '%';
        applyWatermarkToPreview();
    });
    
    textSize.addEventListener('input', function() {
        textSizeValue.textContent = this.value + 'px';
        applyWatermarkToPreview();
    });
    
    barHeight.addEventListener('input', function() {
        barHeightValue.textContent = this.value + 'px';
        applyWatermarkToPreview();
    });
    
    barOpacity.addEventListener('input', function() {
        barOpacityValue.textContent = this.value + '%';
        applyWatermarkToPreview();
    });
    
    barTextSize.addEventListener('input', function() {
        barTextSizeValue.textContent = this.value + 'px';
        applyWatermarkToPreview();
    });
    
    textColor.addEventListener('input', applyWatermarkToPreview);
    barTextColor.addEventListener('input', applyWatermarkToPreview);
    textPosition.addEventListener('change', applyWatermarkToPreview);
    barTextPosition.addEventListener('change', applyWatermarkToPreview);
    
    // Warning popup elements
    const watermarkWarning = document.getElementById('watermark-warning');
    const cancelNoWatermark = document.getElementById('cancel-no-watermark');
    const confirmNoWatermark = document.getElementById('confirm-no-watermark');
    let pendingTabButton = null;
    
    // Tab handling
    tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // If "None" tab is clicked, show warning popup
            if (tabName === 'none' && currentTab !== 'none') {
                pendingTabButton = this;
                watermarkWarning.style.display = 'block';
                return; // Don't proceed until user confirms
            }
            
            // For other tabs, or when already on "None", proceed normally
            applyTabChange(this, tabName);
        });
    });
    
    // Warning popup handlers
    cancelNoWatermark.addEventListener('click', function() {
        watermarkWarning.style.display = 'none';
        pendingTabButton = null;
    });
    
    confirmNoWatermark.addEventListener('click', function() {
        watermarkWarning.style.display = 'none';
        if (pendingTabButton) {
            applyTabChange(pendingTabButton, 'none');
            pendingTabButton = null;
        }
    });
    
    function applyTabChange(button, tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update active tab button
        tabButtons.forEach(btn => {
            btn.style.borderBottom = '2px solid transparent';
            btn.style.fontWeight = '400';
        });
        button.style.borderBottom = '2px solid #3498db';
        button.style.fontWeight = '500';
        
        // Show or hide the appropriate content based on tab
        const textOptions = document.getElementById('text-options');
        const barOptions = document.getElementById('bar-options');
        
        if (tabName === 'text') {
            console.log('Showing text options');
            if (textOptions) textOptions.style.display = 'block';
            if (barOptions) barOptions.style.display = 'none';
        } else if (tabName === 'bar') {
            console.log('Showing bar options');
            if (textOptions) textOptions.style.display = 'none';
            if (barOptions) barOptions.style.display = 'block';
        } else if (tabName === 'none') {
            console.log('Hiding all options');
            if (textOptions) textOptions.style.display = 'none';
            if (barOptions) barOptions.style.display = 'none';
        }
        
        // Update current tab
        currentTab = tabName;
        
        // Update watermark notice
        if (tabName === 'none') {
            watermarkNotice.textContent = '⚠️ Photo will NOT include watermark';
            watermarkNotice.style.color = '#e74c3c';
        } else {
            watermarkNotice.textContent = '✓ Photo will include watermark';
            watermarkNotice.style.color = '#2ecc71';
        }
        
        // Apply watermark to preview if an image is loaded
        applyWatermarkToPreview();
    }
    
    let previewImage;
    let originalImageData;
    
    photoInput.addEventListener('change', function(e) {
        console.log('Photo input change detected', e.target.files);
        if (e.target.files && e.target.files[0]) {
            console.log('Valid file selected');
            const reader = new FileReader();
            
            reader.onload = function(event) {
                console.log('File loaded');
                // Use the existing preview image instead of creating a new one
                previewImage = document.getElementById('photo-preview');
                if (!previewImage) {
                    console.log('Creating new preview image');
                    previewImage = document.createElement('img');
                    previewImage.id = 'photo-preview';
                    previewImage.style.maxWidth = '100%';
                    previewImage.style.height = 'auto';
                    previewImage.style.border = '1px solid #ddd';
                    previewImage.style.borderRadius = '8px';
                    previewImage.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                    previewContainer.appendChild(previewImage);
                }
                
                // Store original image data
                originalImageData = event.target.result;
                
                // Make sure the preview container is visible
                previewContainer.style.display = 'block';
                
                // Create a temporary image to get dimensions before showing preview
                const tempImg = new Image();
                tempImg.onload = function() {
                    // Set original image first, then apply watermark
                    previewImage.src = originalImageData;
                    console.log('Preview image source set');
                    setTimeout(applyWatermarkToPreview, 50); // Apply watermark after a short delay
                };
                tempImg.src = event.target.result;
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    function hexToRgba(hex, opacity) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    function applyWatermarkToPreview() {
        if (!previewImage) {
            console.error('No preview image element found');
            previewImage = document.getElementById('photo-preview');
            if (!previewImage) {
                console.error('Still cannot find preview image element');
                return;
            }
        }
        
        if (!originalImageData) {
            console.error('No image data to process');
            return; // No image to process
        }
        
        try {
            // Load the original image to avoid compounding effects
            const img = new Image();
            
            // Add error handler
            img.onerror = function(e) {
                console.error('Error loading image for watermark:', e);
                // Fallback to direct preview if watermarking fails
                previewImage.src = originalImageData;
            };
            
            img.onload = function() {
                // Create canvas to apply watermark
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Get username
            const username = document.getElementById('username').value || 'User';
            
            // Apply watermark based on current tab
            if (currentTab === 'text') {
                // Text watermark
                const opacity = parseInt(textOpacity.value) / 100;
                const baseSize = parseInt(textSize.value); // This is our base size
                const color = textColor.value;
                const position = textPosition.value;
                
                // Calculate font size as a percentage of image width to maintain proportions
                // Reference size is based on 1000px width image
                const referenceWidth = 1000;
                const fontSize = Math.round((canvas.width / referenceWidth) * baseSize);
                
                ctx.fillStyle = hexToRgba(color, opacity);
                ctx.font = `${fontSize}px Arial`;
                
                const text = `Photo © RailHubPictures.org | ${username}`;
                const textWidth = ctx.measureText(text).width;
                
                let x, y;
                
                // Calculate padding that scales with image size
                const paddingBase = 10; // Base padding in pixels for a 1000px reference image
                const padding = Math.round((canvas.width / referenceWidth) * paddingBase);
                
                switch (position) {
                    case 'top-left':
                        x = padding;
                        y = padding + fontSize;
                        break;
                    case 'top-right':
                        x = canvas.width - textWidth - padding;
                        y = padding + fontSize;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = canvas.height - padding;
                        break;
                    case 'bottom-right':
                        x = canvas.width - textWidth - padding;
                        y = canvas.height - padding;
                        break;
                    case 'center':
                        x = (canvas.width - textWidth) / 2;
                        y = canvas.height / 2;
                        break;
                }
                
                ctx.fillText(text, x, y);
            } 
            else if (currentTab === 'bar') {
                // Bar watermark
                const baseBarHeight = parseInt(barHeight.value);
                const opacity = parseInt(barOpacity.value) / 100;
                const position = barTextPosition.value; // Using the selected position (top/bottom/left/right)
                const color = barTextColor.value;
                const baseTextSize = parseInt(barTextSize.value);
                
                // Calculate sizes proportionally to image dimensions
                // Reference size is based on 1000px width/height
                const referenceSize = 1000;
                const referenceValue = position === 'left' || position === 'right' ? 
                    canvas.height : canvas.width;
                    
                const barHeightValue = Math.round((referenceValue / referenceSize) * baseBarHeight);
                const fontSize = Math.round((referenceValue / referenceSize) * baseTextSize);
                
                // Draw semi-transparent bar
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                
                const text = `Photo © RailHubPictures.org | ${username}`;
                const textWidth = ctx.measureText(text).width;
                const textHeight = fontSize;
                
                // Calculate padding that scales with the image size
                const paddingBase = 20; // Base padding in pixels for a 1000px reference image
                const padding = Math.round((canvas.width / referenceSize) * paddingBase);
                
                if (position === 'top') {
                    // Bar at the top
                    ctx.fillRect(0, 0, canvas.width, barHeightValue);
                    ctx.fillStyle = color;
                    ctx.font = `${fontSize}px Arial`;
                    // Position text on the left with scaled padding
                    ctx.fillText(text, padding, barHeightValue / 2 + fontSize / 3);
                } 
                else if (position === 'bottom') {
                    // Bar at the bottom
                    ctx.fillRect(0, canvas.height - barHeightValue, canvas.width, barHeightValue);
                    ctx.fillStyle = color;
                    ctx.font = `${fontSize}px Arial`;
                    // Position text on the left with scaled padding
                    ctx.fillText(text, padding, canvas.height - barHeightValue / 2 + fontSize / 3);
                }
                else if (position === 'left') {
                    // Bar on the left
                    ctx.fillRect(0, 0, barHeightValue, canvas.height);
                    ctx.fillStyle = color;
                    ctx.font = `${fontSize}px Arial`;
                    // Rotate text and position it on the left side with scaled padding
                    ctx.save();
                    ctx.translate(barHeightValue / 2 + fontSize / 3, canvas.height - padding);
                    ctx.rotate(-Math.PI/2);
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                }
                else if (position === 'right') {
                    // Bar on the right
                    ctx.fillRect(canvas.width - barHeightValue, 0, barHeightValue, canvas.height);
                    ctx.fillStyle = color;
                    ctx.font = `${fontSize}px Arial`;
                    // Rotate text and position it on the right side with scaled padding
                    ctx.save();
                    ctx.translate(canvas.width - barHeightValue / 2 - fontSize / 3, padding + textWidth);
                    ctx.rotate(-Math.PI/2);
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                }
            }
            
            // No watermark for 'none' tab
            
            // Update preview with watermarked image
            previewImage.src = canvas.toDataURL('image/jpeg');
        };
        img.src = originalImageData;
        } catch (err) {
            console.error('Error applying watermark:', err);
            // Fallback to direct preview
            if (previewImage) {
                previewImage.src = originalImageData;
            }
        }
    }

    // Initialize the default tab
    const defaultTabButton = document.querySelector('[data-tab="text"]');
    if (defaultTabButton) {
        applyTabChange(defaultTabButton, 'text');
    }
    
    // Form submission handler - include watermark data
    document.getElementById('upload-form').addEventListener('submit', function(event) {
        // Add watermark data to form
        const watermarkData = document.createElement('input');
        watermarkData.type = 'hidden';
        watermarkData.name = 'watermarkSettings';
        
        const settings = {
            type: currentTab,
            textSettings: currentTab === 'text' ? {
                opacity: textOpacity.value,
                size: textSize.value,
                color: textColor.value,
                position: textPosition.value
            } : null,
            barSettings: currentTab === 'bar' ? {
                height: barHeight.value,
                opacity: barOpacity.value,
                textColor: barTextColor.value,
                textSize: barTextSize.value,
                position: barTextPosition.value
            } : null
        };
        
        watermarkData.value = JSON.stringify(settings);
        this.appendChild(watermarkData);
    });
});
