// Global variables
let existingUnits = [];
let currentUser = null;
let uploadForm;
let railroadInput;
let modelInput;
let numberInput;
let locomotivesContainer;
let tagsContainer;
let mainSubmitButton;
let directSubmitBtn;

// Initialize once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing locomotive form');
    
    // Initialize form elements
    uploadForm = document.getElementById('upload-form');
    railroadInput = document.getElementById('current-railroad');
    modelInput = document.getElementById('current-model');
    numberInput = document.getElementById('current-number');
    locomotivesContainer = document.getElementById('locomotives-container');
    tagsContainer = document.getElementById('locomotive-tags');
    mainSubmitButton = document.querySelector('.submit-button');
    
    // Set up the add locomotive button
    setupAddLocomotiveButton();
    
    // Setup railroad autocomplete
    setupRailroadAutocomplete();
    
    // Setup confirmation dialog
    setupConfirmationDialog();
    
    // Fetch existing units from API
    fetchExistingUnits();
    
    // Setup form submission
    setupFormSubmission();
});

// Setup add locomotive button
function setupAddLocomotiveButton() {
    let addBtn = document.getElementById('add-locomotive');
    console.log('Add button element:', addBtn); // Debug to verify the button exists
    
    // Remove any existing event listeners
    const newAddBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    addBtn = document.getElementById('add-locomotive');
    
    // Add button click event
    addBtn.addEventListener('click', function() {
        // Add debug logging to see if the event is firing
        console.log('Add button clicked!');
        addLocomotive();
    });
    
    // Make sure the add button is visible and properly styled
    addBtn.style.display = 'block';
    addBtn.style.cursor = 'pointer';
    addBtn.style.fontWeight = 'bold';
    addBtn.style.position = 'relative';
}

// Function to check if locomotive exists
function checkLocomotiveExists(railroad, number) {
    if (!existingUnits || existingUnits.length === 0) return null;
    
    return existingUnits.find(u => 
        u?.railroad?.toLowerCase() === railroad?.toLowerCase() &&
        u?.number === number
    );
}

// Function to add a locomotive
function addLocomotive() {
    console.log('addLocomotive function called');
    
    const railroad = railroadInput.value.trim();
    const model = modelInput.value.trim();
    const number = numberInput.value.trim();
    
    console.log('Locomotive values:', {railroad, model, number});
    
    if (!railroad || !model || !number) {
        alert("Please fill in all locomotive fields");
        return;
    }
    
    // Check if locomotive exists in our database
    const existingUnit = checkLocomotiveExists(railroad, number);
    console.log('Existing unit check:', existingUnit);
    
    if (!existingUnit) {
        // Show confirmation dialog since this is a new locomotive
        const confirmDialog = document.getElementById('locomotive-confirmation');
        const confirmRailroad = document.getElementById('confirm-railroad');
        const confirmModel = document.getElementById('confirm-model');
        const confirmNumber = document.getElementById('confirm-number');
        
        // Set the values in the confirmation dialog
        confirmRailroad.textContent = railroad;
        confirmModel.textContent = model;
        confirmNumber.textContent = number;
        
        // Show the confirmation dialog
        confirmDialog.style.display = 'flex';
        
        // Set up confirmation buttons
        const confirmBtn = confirmDialog.querySelector('.btn-confirm');
        const editBtn = confirmDialog.querySelector('.btn-edit');
        
        // Remove any existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newEditBtn = editBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        
        // Get the new buttons
        const updatedConfirmBtn = confirmDialog.querySelector('.btn-confirm');
        const updatedEditBtn = confirmDialog.querySelector('.btn-edit');
        
        // Add event listeners to the new buttons
        updatedConfirmBtn.addEventListener('click', function() {
            console.log('Confirmation: Yes, add this locomotive');
            confirmDialog.style.display = 'none';
            
            // Add the locomotive to our database
            addLocomotiveToDatabase(railroad, model, number)
                .then(newUnit => {
                    if (newUnit) {
                        addLocomotiveToForm(railroad, model, number, newUnit);
                    } else {
                        // If adding to database failed, still add to form but without DB ID
                        addLocomotiveToForm(railroad, model, number, null);
                    }
                })
                .catch(error => {
                    console.error('Error adding locomotive to database:', error);
                    // Still add to form even if DB operation failed
                    addLocomotiveToForm(railroad, model, number, null);
                });
        });
        
        updatedEditBtn.addEventListener('click', function() {
            console.log('Confirmation: No, edit details');
            confirmDialog.style.display = 'none';
            // Focus back on the railroad input
            railroadInput.focus();
        });
    } else {
        // Locomotive exists, add it directly to the form
        addLocomotiveToForm(railroad, model, number, existingUnit);
    }
}

function addLocomotiveToForm(railroad, model, number, existingUnit) {
    // Create a unique index for this locomotive
    const index = document.querySelectorAll('.locomotive-tag').length;
    
    // Create the hidden fields for this locomotive
    const railroadField = document.createElement('input');
    railroadField.type = 'hidden';
    railroadField.name = `locomotives[${index}][railroad]`;
    railroadField.value = railroad;
    locomotivesContainer.appendChild(railroadField);
    
    const modelField = document.createElement('input');
    modelField.type = 'hidden';
    modelField.name = `locomotives[${index}][model]`;
    modelField.value = model;
    locomotivesContainer.appendChild(modelField);
    
    const numberField = document.createElement('input');
    numberField.type = 'hidden';
    numberField.name = `locomotives[${index}][number]`;
    numberField.value = number;
    locomotivesContainer.appendChild(numberField);
    
    if (existingUnit && existingUnit.id) {
        const idField = document.createElement('input');
        idField.type = 'hidden';
        idField.name = `locomotives[${index}][id]`;
        idField.value = existingUnit.id;
        locomotivesContainer.appendChild(idField);
    }
    
    // Create a visual tag for this locomotive
    const tag = document.createElement('div');
    tag.className = 'locomotive-tag';
    tag.dataset.index = index;
    
    // Add color dot based on railroad
    const colorDot = document.createElement('span');
    colorDot.className = 'railroad-color-dot';
    colorDot.style.backgroundColor = getRailroadColor(railroad);
    tag.appendChild(colorDot);
    
    // Add locomotive label
    const label = document.createTextNode(`${railroad} ${number} (${model})`);
    tag.appendChild(label);
    
    // Add remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-tag';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', function() {
        tag.remove();
        railroadField.remove();
        modelField.remove();
        numberField.remove();
        
        if (existingUnit && existingUnit.id) {
            idField.remove();
        }
        
        // Check if we need to show the empty message
        if (document.querySelectorAll('.locomotive-tag').length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-tag-message';
            emptyMsg.textContent = 'No locomotives added yet';
            tagsContainer.appendChild(emptyMsg);
        }
    });
    tag.appendChild(removeBtn);
    
    // Remove empty message if it exists
    const emptyMsg = tagsContainer.querySelector('.empty-tag-message');
    if (emptyMsg) {
        emptyMsg.remove();
    }
    
    // Add the tag
    tagsContainer.appendChild(tag);
    
    // Clear the inputs
    railroadInput.value = '';
    modelInput.value = '';
    numberInput.value = '';
    
    // Focus back on railroad input
    railroadInput.focus();
}

function getRailroadColor(railroad) {
    const railroadColors = {
        'UP': '#FFCC00',
        'BNSF': '#F78D1E',
        'NS': '#000000',
        'CSX': '#0066CC',
        'CN': '#418246',
        'CP': '#D32D27',
        'CPKC': '#D32D27'
    };
    
    // Convert railroad to uppercase for matching
    railroad = railroad.toUpperCase();
    
    // Return the color or a default
    if (!railroadColors[railroad]) {
        // Generate a color based on the railroad name
        let hash = 0;
        for (let i = 0; i < railroad.length; i++) {
            hash = railroad.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
    return railroadColors[railroad];
}

function setupRailroadAutocomplete() {
    const railroads = ['UP', 'BNSF', 'NS', 'CSX', 'CN', 'CPKC', 'Amtrak', 'KCS', 'SLRG'];
    const suggestionsContainer = document.querySelector('.railroad-suggestions');
    
    // Show suggestions when typing in the railroad input
    railroadInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        
        if (value) {
            suggestionsContainer.style.display = 'block';
            
            const matchingRailroads = railroads.filter(r => 
                r.toLowerCase().includes(value)
            );
            
            matchingRailroads.forEach(r => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                
                // Add color dot
                const colorDot = document.createElement('span');
                colorDot.className = 'railroad-color-dot';
                colorDot.style.backgroundColor = getRailroadColor(r);
                item.appendChild(colorDot);
                
                // Add railroad name
                const text = document.createTextNode(r);
                item.appendChild(text);
                
                item.addEventListener('click', function() {
                    railroadInput.value = r;
                    suggestionsContainer.style.display = 'none';
                    modelInput.focus();
                });
                
                suggestionsContainer.appendChild(item);
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== railroadInput && e.target !== suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

function setupConfirmationDialog() {
    // If user presses Enter in the number input, trigger the add button
    numberInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLocomotive();
        }
    });
}

function addLocomotiveToDatabase(railroad, model, number) {
    // Return a promise for the async operation
    return new Promise((resolve, reject) => {
        // Check if we have a logged-in user
        if (!window.Clerk || !window.Clerk.user) {
            console.warn('User not authenticated, skipping database add');
            resolve(null);
            return;
        }
        
        // Get auth token from Clerk
        window.Clerk.session.getToken().then(token => {
            // Create the locomotive data
            const locoData = {
                railroad: railroad,
                model: model,
                number: number,
                added_by: window.Clerk.user.id
            };
            
            // Send to API
            fetch('/api/locomotives/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(locoData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add locomotive to database');
                }
                return response.json();
            })
            .then(data => {
                console.log('Added locomotive to database:', data);
                // Add to our local cache of existingUnits
                if (data.id) {
                    const newUnit = {
                        id: data.id,
                        railroad: railroad,
                        model: model,
                        number: number
                    };
                    existingUnits.push(newUnit);
                    resolve(newUnit);
                } else {
                    resolve(null);
                }
            })
            .catch(error => {
                console.error('Error adding locomotive to database:', error);
                resolve(null);
            });
        })
        .catch(error => {
            console.error('Error getting auth token:', error);
            resolve(null);
        });
    });
}

function fetchExistingUnits() {
    // Fetch units from API
    fetch('/api/locomotives')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched existing units:', data);
            existingUnits = data;
        })
        .catch(error => {
            console.error('Error fetching units:', error);
            existingUnits = [];
        });
}

function setupFormSubmission() {
    // Create a debug direct submit button for testing
    directSubmitBtn = document.createElement('button');
    directSubmitBtn.type = 'button';
    directSubmitBtn.textContent = 'Force Upload (Debug)';
    directSubmitBtn.className = 'submit-button';
    directSubmitBtn.style.marginTop = '10px';
    directSubmitBtn.style.backgroundColor = '#666';
    mainSubmitButton.insertAdjacentElement('afterend', directSubmitBtn);
    
    // Use the form submission handler
    let formSubmitHandler = function(e) {
        e.preventDefault();
        console.log('Form submit handler triggered');
        
        // Check if user is authenticated with Clerk
        if (!window.Clerk || !window.Clerk.user) {
            showStatusMessage('Please sign in to upload photos', 'error');
            return false;
        }
        
        // Create FormData for submission
        const formData = new FormData();
        
        // Add form fields
        formData.append('title', document.getElementById('title').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('photo_date', document.getElementById('photo_date').value);
        
        // Add user info from Clerk
        formData.append('username', window.Clerk.user.username || window.Clerk.user.firstName);
        formData.append('user_id', window.Clerk.user.id);
        
        // Add photo file
        const photoFile = document.getElementById('photo').files[0];
        if (!photoFile) {
            showStatusMessage('Please select a photo to upload', 'error');
            return;
        }
        formData.append('photo', photoFile);
        
        // Collect locomotives data
        const locomotives = [];
        const locomotiveInputs = document.querySelectorAll('[name^="locomotives["]');
        const locoIds = new Set();
        
        locomotiveInputs.forEach(input => {
            const match = input.name.match(/locomotives\[(\d+)\]\[(\w+)\]/);
            if (match) {
                const index = match[1];
                const field = match[2];
                
                if (!locoIds.has(index)) {
                    locoIds.add(index);
                    locomotives.push({});
                }
                
                const locoIndex = Array.from(locoIds).indexOf(index);
                locomotives[locoIndex][field] = input.value;
            }
        });
        
        // Add locomotives data to form
        formData.append('locomotives', JSON.stringify(locomotives));
        
        // Set first locomotive as primary unit
        if (locomotives.length > 0) {
            formData.append('primary_unit', locomotives[0].unit_id || 'new');
        }
        
        // Disable submit button and show loading state
        const submitButton = document.querySelector('.submit-button');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Uploading...';
        
        // Create a progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress" style="width: 0%"></div>
            </div>
            <div class="progress-text">0%</div>
        `;
        document.querySelector('.upload-section').appendChild(progressContainer);
        
        // Create and configure XMLHttpRequest for monitoring upload progress
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/photos/upload', true);
        
        // Get Clerk JWT token and add as Authorization header
        window.Clerk.session.getToken().then(token => {
            // Add authorization header
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            
            // Track upload progress
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressContainer.querySelector('.progress').style.width = percent + '%';
                    progressContainer.querySelector('.progress-text').textContent = percent + '%';
                    
                    // Show status message
                    showStatusMessage(`Uploading: ${percent}% complete`, 'info');
                }
            };
            
            // Handle completion
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            showStatusMessage('Upload successful!', 'success');
                            // Clear form after success
                            uploadForm.reset();
                            
                            // Remove all locomotive entries except the first one
                            const locoEntries = document.querySelectorAll('.locomotive-tag');
                            for (let i = 0; i < locoEntries.length; i++) {
                                locoEntries[i].remove();
                            }
                            
                            // Add empty message back
                            const emptyMsg = document.createElement('div');
                            emptyMsg.className = 'empty-tag-message';
                            emptyMsg.textContent = 'No locomotives added yet';
                            tagsContainer.appendChild(emptyMsg);
                            
                            // Remove progress bar
                            progressContainer.remove();
                            
                            // Reset button
                            submitButton.disabled = false;
                            submitButton.textContent = originalButtonText;
                            
                            // Redirect to view photo
                            if (response.id) {
                                setTimeout(() => {
                                    window.location.href = `/photo.html?id=${response.id}`;
                                }, 1500);
                            }
                        } else {
                            showStatusMessage('Upload failed: ' + (response.error || 'Unknown error'), 'error');
                            submitButton.disabled = false;
                            submitButton.textContent = originalButtonText;
                        }
                    } catch (e) {
                        showStatusMessage('Error parsing response: ' + e.message, 'error');
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                } else {
                    showStatusMessage('Upload failed with status: ' + xhr.status, 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            };
            
            // Handle errors
            xhr.onerror = function() {
                showStatusMessage('Network error during upload', 'error');
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            };
            
            // Send the form data
            xhr.send(formData);
        }).catch(error => {
            showStatusMessage('Authentication error: ' + error.message, 'error');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
        
        return false;
    };
    
    // Direct submit button creates a form and submits via XMLHttpRequest
    directSubmitBtn.addEventListener('click', function() {
        console.log('Submit button clicked directly');
        formSubmitHandler({preventDefault: () => {}});
    });
    
    // Ensure proper form submission handling
    console.log('Attaching form submit handler');
    
    // Remove any existing handlers first
    const oldForm = uploadForm.cloneNode(true);
    uploadForm.parentNode.replaceChild(oldForm, uploadForm);
    
    // Get the new form reference
    const newForm = document.getElementById('upload-form');
    
    // Add the submit event handler
    newForm.addEventListener('submit', function(e) {
        console.log('Form submit intercepted');
        e.preventDefault();
        formSubmitHandler(e);
        return false;
    });
    
    // Make the submit button explicitly call the handler
    mainSubmitButton = document.querySelector('.submit-button');
    mainSubmitButton.addEventListener('click', function(e) {
        console.log('Submit button clicked');
        e.preventDefault();
        formSubmitHandler(e);
        return false;
    });
    
    console.log('Form submit handler attached');
}

function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    if (!statusMessage) {
        console.error('Status message element not found');
        return;
    }
    
    // Clear any existing timeout
    if (window.statusMessageTimeout) {
        clearTimeout(window.statusMessageTimeout);
    }
    
    // Set message content with icon based on type
    let icon = '';
    if (type === 'success') {
        icon = '✅ ';
        statusMessage.className = 'status-success';
    } else if (type === 'error') {
        icon = '❌ ';
        statusMessage.className = 'status-error';
    } else if (type === 'info') {
        icon = 'ℹ️ ';
        statusMessage.className = 'status-info';
    } else if (type === 'warning') {
        icon = '⚠️ ';
        statusMessage.className = 'status-warning';
    }
    
    statusMessage.textContent = icon + message;
    statusMessage.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        window.statusMessageTimeout = setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}
