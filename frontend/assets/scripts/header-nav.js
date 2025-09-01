document.addEventListener('DOMContentLoaded', function() {
	// Check login status from localStorage
	const loggedIn = localStorage.getItem('loggedIn') === 'true';
	const username = localStorage.getItem('username');
	const profilePic = localStorage.getItem('profilePic');

	// Insert the header, nav, and footer into the document
	document.body.insertAdjacentHTML('afterbegin', headerContent);
});

// Sign out function
function handleSignOut() {
	localStorage.removeItem('loggedIn');
	localStorage.removeItem('username');
	localStorage.removeItem('profilePic');
	window.location.href = 'index.html';
}