// Photo upload script for Cloudflare integration
document.addEventListener('DOMContentLoaded', function() {
    // Check if the upload form exists on this page
    const uploadForm = document.getElementById('upload-form');
    if (!uploadForm) return;

    // Load railroads and locomotive models for dropdowns
    loadRailroadOptions();
    
    // Handle form submission
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check if user is authenticated
        if (!window.Clerk || !window.Clerk.user) {
            alert('Please sign in to upload photos');
            if (window.Clerk) window.Clerk.openSignIn();
            return;
        }
        
        // Show loading state
        const submitButton = document.querySelector('#upload-form button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Uploading...';
        submitButton.disabled = true;
        
        try {
            // Get form data
            const formData = new FormData(uploadForm);
            
            // Add selected locomotives to form data
            const selectedUnits = getSelectedLocomotives();
            if (selectedUnits.length === 0) {
                alert('Please select at least one locomotive');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                return;
            }
            
            formData.append('units', JSON.stringify(selectedUnits.map(u => u.id)));
            
            // Set primary unit if available
            if (selectedUnits.length > 0) {
                formData.append('primary_unit', selectedUnits[0].id);
            }
            
            // Upload the photo via API
            const result = await window.railhubAPI.uploadPhoto(formData);
            
            // Show success message
            alert('Photo uploaded successfully!');
            
            // Redirect to the photo page
            window.location.href = `/showpictureid=${result.id}.html`;
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading photo: ' + (error.message || 'Unknown error'));
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Set up locomotive selection
    setupLocomotiveSelection();
});

// Load railroad options from the API
async function loadRailroadOptions() {
    try {
        const railroadSelect = document.getElementById('railroad');
        if (!railroadSelect) return;
        
        // Clear existing options
        railroadSelect.innerHTML = '<option value="">Select Railroad</option>';
        
        // Get all units from API
        const units = await window.railhubAPI.getAllUnits();
        
        // Extract unique railroads
        const railroads = [...new Set(units.map(unit => unit.railroad))].sort();
        
        // Add options to select
        railroads.forEach(railroad => {
            const option = document.createElement('option');
            option.value = railroad;
            option.textContent = railroad;
            railroadSelect.appendChild(option);
        });
        
        // Set up change event to load locomotive numbers
        railroadSelect.addEventListener('change', function() {
            loadLocomotiveOptions(units, this.value);
        });
    } catch (error) {
        console.error('Error loading railroad options:', error);
    }
}

// Load locomotive options based on selected railroad
function loadLocomotiveOptions(allUnits, selectedRailroad) {
    const locoSelect = document.getElementById('locomotive-number');
    if (!locoSelect) return;
    
    // Clear existing options
    locoSelect.innerHTML = '<option value="">Select Locomotive</option>';
    
    // Filter units by selected railroad
    const filteredUnits = allUnits.filter(unit => unit.railroad === selectedRailroad);
    
    // Sort by number
    filteredUnits.sort((a, b) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
    });
    
    // Add options to select
    filteredUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = `${unit.number} - ${unit.model || 'Unknown'}`;
        option.dataset.unitData = JSON.stringify(unit);
        locoSelect.appendChild(option);
    });
}

// Set up locomotive selection interface
function setupLocomotiveSelection() {
    const addLocoButton = document.getElementById('add-locomotive');
    const locoSelect = document.getElementById('locomotive-number');
    const selectedLocosContainer = document.getElementById('selected-locomotives');
    
    if (!addLocoButton || !locoSelect || !selectedLocosContainer) return;
    
    // Handle adding locomotives
    addLocoButton.addEventListener('click', function() {
        const selectedOption = locoSelect.options[locoSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value) return;
        
        try {
            const unitData = JSON.parse(selectedOption.dataset.unitData);
            addLocomotiveToSelection(unitData, selectedLocosContainer);
        } catch (error) {
            console.error('Error adding locomotive:', error);
        }
    });
}

// Add a locomotive to the selection area
function addLocomotiveToSelection(unit, container) {
    // Check if already added
    if (document.querySelector(`[data-unit-id="${unit.id}"]`)) {
        alert('This locomotive is already added');
        return;
    }
    
    // Create locomotive display element
    const locoElement = document.createElement('div');
    locoElement.className = 'selected-locomotive';
    locoElement.dataset.unitId = unit.id;
    
    locoElement.innerHTML = `
        <span>${unit.railroad} ${unit.number} (${unit.model || 'Unknown'})</span>
        <span class="remove-loco">×</span>
        <input type="hidden" name="selected_unit_${unit.id}" value="${unit.id}">
        <label>
            <input type="radio" name="primary_unit" value="${unit.id}" ${document.querySelectorAll('.selected-locomotive').length === 0 ? 'checked' : ''}>
            Primary
        </label>
    `;
    
    // Add remove functionality
    locoElement.querySelector('.remove-loco').addEventListener('click', function() {
        container.removeChild(locoElement);
        
        // If this was the primary and there are others, make the first one primary
        if (locoElement.querySelector('input[type="radio"]').checked) {
            const firstLoco = document.querySelector('.selected-locomotive input[type="radio"]');
            if (firstLoco) firstLoco.checked = true;
        }
    });
    
    // Add to container
    container.appendChild(locoElement);
}

// Get all selected locomotives
function getSelectedLocomotives() {
    const selectedLocos = [];
    document.querySelectorAll('.selected-locomotive').forEach(element => {
        selectedLocos.push({
            id: element.dataset.unitId,
            isPrimary: element.querySelector('input[type="radio"]').checked
        });
    });
    return selectedLocos;
}
