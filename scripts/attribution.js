// Attribution functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle image preview and attribution
    const photoInput = document.getElementById('photo');
    const previewContainer = document.getElementById('photo-preview-container');
    const attributionNotice = document.getElementById('attribution-notice');
    
    // Attribution tab elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const attributionOptions = document.getElementById('attribution-options');
    
    // Default tab
    let currentTab = 'text'; // Set default to text attribution
    
    // Text attribution options
    const textOpacity = document.getElementById('text-opacity');
    const textOpacityValue = document.getElementById('text-opacity-value');
    const textSize = document.getElementById('text-size');
    const textSizeValue = document.getElementById('text-size-value');
    const textColor = document.getElementById('text-color');
    const textPosition = document.getElementById('text-position');
    
    // Bar attribution options
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
        applyAttributionToPreview();
    });
    
    textSize.addEventListener('input', function() {
        textSizeValue.textContent = this.value + 'px';
        applyAttributionToPreview();
    });
    
    barHeight.addEventListener('input', function() {
        barHeightValue.textContent = this.value + 'px';
        applyAttributionToPreview();
    });
    
    barOpacity.addEventListener('input', function() {
        barOpacityValue.textContent = this.value + '%';
        applyAttributionToPreview();
    });
    
    barTextSize.addEventListener('input', function() {
        barTextSizeValue.textContent = this.value + 'px';
        applyAttributionToPreview();
    });
    
    textColor.addEventListener('input', applyAttributionToPreview);
    barTextColor.addEventListener('input', applyAttributionToPreview);
    textPosition.addEventListener('change', applyAttributionToPreview);
    barTextPosition.addEventListener('change', applyAttributionToPreview);
    
    // Warning popup elements
    const attributionWarning = document.getElementById('attribution-warning');
    const cancelNoAttribution = document.getElementById('cancel-no-attribution');
    const confirmNoAttribution = document.getElementById('confirm-no-attribution');
    let pendingTabButton = null;
    
    // Tab handling
    tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // If "None" tab is clicked, show warning popup
            if (tabName === 'none' && currentTab !== 'none') {
                pendingTabButton = this;
                attributionWarning.style.display = 'block';
                return; // Don't proceed until user confirms
            }
            
            // For other tabs, or when already on "None", proceed normally
            applyTabChange(this, tabName);
        });
    });
    
    // Warning popup handlers
    cancelNoAttribution.addEventListener('click', function() {
        attributionWarning.style.display = 'none';
        pendingTabButton = null;
    });
    
    confirmNoAttribution.addEventListener('click', function() {
        attributionWarning.style.display = 'none';
        if (pendingTabButton) {
            applyTabChange(pendingTabButton, 'none');
            pendingTabButton = null;
        }
    });
    
    function applyTabChange(button, tabName) {
        // Update active tab button
        tabButtons.forEach(btn => {
            btn.style.borderBottom = '2px solid transparent';
            btn.style.fontWeight = '400';
        });
        button.style.borderBottom = '2px solid #3498db';
        button.style.fontWeight = '500';
        
        // Show selected tab content
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        
        const selectedContent = document.getElementById(tabName + '-options');
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }
        
        // Update current tab
        currentTab = tabName;
        
        // Update attribution notice
        if (tabName === 'none') {
            attributionNotice.textContent = '⚠️ Photo will NOT include attribution';
            attributionNotice.style.color = '#e74c3c';
        } else {
            attributionNotice.textContent = '✓ Photo will include attribution';
            attributionNotice.style.color = '#2ecc71';
        }
        
        // Apply attribution to preview if an image is loaded
        applyAttributionToPreview();
    }
    
    let previewImage;
    let originalImageData;
    
    photoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                previewContainer.style.display = 'block';
                previewContainer.innerHTML = '';
                
                // Create preview image
                previewImage = document.createElement('img');
                previewImage.style.maxWidth = '100%';
                previewImage.style.borderRadius = '8px';
                previewImage.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                previewContainer.appendChild(previewImage);
                
                // Store original image data
                originalImageData = event.target.result;
                
                // Create a temporary image to get dimensions before showing preview
                const tempImg = new Image();
                tempImg.onload = function() {
                    // Set original image first, then apply attribution
                    previewImage.src = originalImageData;
                    setTimeout(applyAttributionToPreview, 50); // Apply attribution after a short delay
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
    
    function applyAttributionToPreview() {
        if (!previewImage || !originalImageData) {
            return; // No image to process
        }
        
        // Load the original image to avoid compounding effects
        const img = new Image();
        img.onload = function() {
            // Create canvas to apply attribution
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Get username
            const username = document.getElementById('username').value || 'User';
            
            // Apply attribution based on current tab
            if (currentTab === 'text') {
                // Text attribution
                ctx.save();
                
                const opacity = textOpacity.value / 100;
                // Use fixed font size regardless of image dimensions
                const fontSize = parseInt(textSize.value);
                const color = textColor.value;
                const position = textPosition.value;
                
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.fillStyle = hexToRgba(color, opacity);
                
                const text = `Photo © RailHubPictures.org | ${username}`;
                const metrics = ctx.measureText(text);
                const padding = 10;
                
                let x, y;
                
                switch (position) {
                    case 'bottom-right':
                        x = canvas.width - metrics.width - padding;
                        y = canvas.height - padding;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = canvas.height - padding;
                        break;
                    case 'top-right':
                        x = canvas.width - metrics.width - padding;
                        y = fontSize + padding;
                        break;
                    case 'top-left':
                        x = padding;
                        y = fontSize + padding;
                        break;
                }
                
                ctx.fillText(text, x, y);
                ctx.restore();
                
            } else if (currentTab === 'bar') {
                // Bar attribution
                ctx.save();
                
                const barHeightValue = parseInt(barHeight.value);
                const opacity = barOpacity.value / 100;
                // Use fixed font size regardless of image dimensions
                const fontSize = parseInt(barTextSize.value);
                const color = barTextColor.value;
                const position = barTextPosition.value;
                
                // Draw black bar
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillRect(0, canvas.height - barHeightValue, canvas.width, barHeightValue);
                
                // Add text
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.fillStyle = color;
                
                const text = `Photo © RailHubPictures.org | ${username}`;
                const metrics = ctx.measureText(text);
                
                let x;
                const y = canvas.height - (barHeightValue / 2) + (fontSize / 3);
                
                switch (position) {
                    case 'center':
                        x = (canvas.width - metrics.width) / 2;
                        break;
                    case 'left':
                        x = 10;
                        break;
                    case 'right':
                        x = canvas.width - metrics.width - 10;
                        break;
                }
                
                ctx.fillText(text, x, y);
                ctx.restore();
            }
            
            // Update preview with attributed image
            if (currentTab !== 'none') {
                previewImage.src = canvas.toDataURL('image/jpeg', 0.92);
            } else {
                previewImage.src = originalImageData;
            }
        };
        
        img.src = originalImageData;
    }
    
    // Compress image to target file size
    function compressImage(dataURL, targetSizeMB = 1, quality = 0.9, minQuality = 0.5) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                // Get original dimensions for status updates
                const originalWidth = img.width;
                const originalHeight = img.height;
                
                // Create canvas with original dimensions
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                // Start compression
                let compressedDataURL = canvas.toDataURL('image/jpeg', quality);
                let currentQuality = quality;
                
                // Helper function to get file size in MB
                function getFileSizeMB(dataURL) {
                    // Remove the data URL prefix to get just the base64 data
                    const base64 = dataURL.split(',')[1];
                    // Base64 represents 6 bits in each character (4 bytes for every 3 original bytes)
                    const fileSize = base64.length * (3/4);
                    return fileSize / (1024 * 1024);
                }
                
                // Check if size is already under target
                let currentSize = getFileSizeMB(compressedDataURL);
                const originalSizeMB = currentSize;
                
                // Track compression steps
                let compressionSteps = 0;
                
                updateCompressionStatus(`Original image: ${originalWidth}x${originalHeight}, ${originalSizeMB.toFixed(2)}MB`);
                
                if (currentSize <= targetSizeMB) {
                    console.log(`Image already small enough: ${currentSize.toFixed(2)}MB`);
                    updateCompressionStatus(`Image already under ${targetSizeMB}MB target size - no compression needed`);
                    resolve(compressedDataURL);
                    return;
                }
                
                // Recursively compress until target size is reached or quality is too low
                function tryCompress() {
                    compressionSteps++;
                    
                    // If quality is already too low, resize the image
                    if (currentQuality <= minQuality) {
                        // Reduce dimensions by 10%
                        const newWidth = Math.floor(canvas.width * 0.9);
                        const newHeight = Math.floor(canvas.height * 0.9);
                        
                        // Update status
                        const scalePercent = Math.round((newWidth / originalWidth) * 100);
                        updateCompressionStatus(`Resizing to ${newWidth}x${newHeight} (${scalePercent}% of original)`);
                        
                        // Create new canvas with reduced dimensions
                        const resizedCanvas = document.createElement('canvas');
                        resizedCanvas.width = newWidth;
                        resizedCanvas.height = newHeight;
                        
                        // Draw resized image
                        const resizedCtx = resizedCanvas.getContext('2d');
                        resizedCtx.drawImage(img, 0, 0, newWidth, newHeight);
                        
                        // Reset quality for the resized image
                        currentQuality = quality;
                        compressedDataURL = resizedCanvas.toDataURL('image/jpeg', currentQuality);
                        currentSize = getFileSizeMB(compressedDataURL);
                        
                        // Update the canvas and image reference for further compressions if needed
                        canvas.width = newWidth;
                        canvas.height = newHeight;
                        img.src = compressedDataURL;
                        
                        if (currentSize <= targetSizeMB) {
                            const compressionRatio = (originalSizeMB / currentSize).toFixed(1);
                            const sizeReduction = ((originalSizeMB - currentSize) / originalSizeMB * 100).toFixed(0);
                            console.log(`Image compressed to ${currentSize.toFixed(2)}MB (${newWidth}x${newHeight})`);
                            updateCompressionStatus(`Image compressed: ${newWidth}x${newHeight}, ${currentSize.toFixed(2)}MB (${sizeReduction}% smaller, ${compressionRatio}x ratio)`);
                            resolve(compressedDataURL);
                        } else {
                            // Try again after a small delay to allow canvas update
                            setTimeout(tryCompress, 100);
                        }
                        return;
                    }
                    
                    // Reduce quality by 10%
                    currentQuality = Math.max(currentQuality - 0.1, minQuality);
                    updateCompressionStatus(`Trying compression with ${Math.round(currentQuality*100)}% quality`);
                    compressedDataURL = canvas.toDataURL('image/jpeg', currentQuality);
                    currentSize = getFileSizeMB(compressedDataURL);
                    
                    if (currentSize <= targetSizeMB) {
                        const compressionRatio = (originalSizeMB / currentSize).toFixed(1);
                        const sizeReduction = ((originalSizeMB - currentSize) / originalSizeMB * 100).toFixed(0);
                        console.log(`Image compressed to ${currentSize.toFixed(2)}MB (quality: ${currentQuality.toFixed(2)})`);
                        updateCompressionStatus(`Image compressed: ${canvas.width}x${canvas.height}, ${currentSize.toFixed(2)}MB (${sizeReduction}% smaller, ${compressionRatio}x ratio) with ${Math.round(currentQuality*100)}% quality`);
                        resolve(compressedDataURL);
                    } else {
                        // Try again with lower quality
                        setTimeout(tryCompress, 50);
                    }
                }
                
                // Start compression
                tryCompress();
            };
            
            img.src = dataURL;
        });
    }
    
    // Update status message if available
    function updateCompressionStatus(message) {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'status-message info';
        }
        console.log(message);
    }
    
    // Get file size in human-readable format
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
    
    // Store the modified image data before submitting
    window.getAttributedImage = async function() {
        updateCompressionStatus('Processing image...');
        
        if (currentTab === 'none' || !originalImageData) {
            // If not using attribution, still compress the original image
            if (originalImageData) {
                updateCompressionStatus('Compressing image for upload...');
                const result = await compressImage(originalImageData);
                updateCompressionStatus('Image compression complete!');
                return result;
            }
            return null;
        }
        
        // Compress the attributed image
        updateCompressionStatus('Compressing attributed image...');
        const result = await compressImage(previewImage.src);
        updateCompressionStatus('Image ready for upload!');
        return result;
    };
});
