// Contents for user-auth.js:
if (!localStorage.getItem('username')) {
	// Save to userdata.json using fetch
	fetch('/saveUserData', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: 'Test User',
			profilePic: 'images/default-avatar.png'
		})
	});
} else {
	// Load user data from server
	fetch('/getUserData')
		.then(response => response.json())
		.then(data => {
			localStorage.setItem('username', data.username);
			localStorage.setItem('profilePic', data.profilePic);
		});
}