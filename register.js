document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = sanitizeInput(document.getElementById('username').value);
    const email = sanitizeInput(document.getElementById('email').value);
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const profilePhoto = document.getElementById('profile_photo').files[0];

    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        showError('All fields are required.');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
    }

    try {
        const response = await fetch('/register', { // Replace '/register' with your backend route
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            document.querySelector('.success-message').style.display = 'block';
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect after success
            }, 3000);
        } else {
            showError(result.message || 'Registration failed.');
        }
    } catch (error) {
        showError('An error occurred during registration.');
        console.error(error);
    }
});
