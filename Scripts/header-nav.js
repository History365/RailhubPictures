document.addEventListener('DOMContentLoaded', function() {
	// Check login status from localStorage
	const loggedIn = localStorage.getItem('loggedIn') === 'true';
	const username = localStorage.getItem('username');
	const profilePic = localStorage.getItem('profilePic');

	// Create the header, nav, and footer content
	const headerContent = `
		<header style="padding: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<a href="index.html"><img src="images/logo.jpg" alt="Logo" style="max-width: 360px; height: auto;"></a>
				<div class="DefText" style="text-align: right; display: flex; align-items: center; gap: 1rem;">
					<div id="userInfo">
						${loggedIn && username ? `Welcome, ${username}` : ''}
					</div>
					<div id="userProfile" style="cursor: pointer;">
						${loggedIn ? `
							<a href="aboutme.html">
								<img src="${profilePic || 'images/default-avatar.png'}" 
									alt="Profile" 
									style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
							</a>
						` : ''}
					</div>
					${(() => {
						var today = new Date();
						var dd = String(today.getDate()).padStart(2, '0');
						var mm = String(today.getMonth() + 1).padStart(2, '0');
						var yyyy = today.getFullYear();
						return mm + '/' + dd + '/' + yyyy;
					})()}
				</div>
			</div>
		</header>

		<div class="content-wrapper" style="display: flex; min-height: calc(100vh - 150px);">
			<nav style="width: 240px; padding: 1rem; border-right: 1px solid #eee;">
				<div class="menu">
					<div class="CallOut" style="border-bottom: solid black 1px; padding: 0.5rem 0;">View Photos</div>
					<ul class="menu" style="list-style: none; padding: 0;">
						<li><a href="index.html" style="padding: 0.5rem 0; display: block;">Home</a></li>
						<li><a href="newestphotos.html" style="padding: 0.5rem 0; display: block;">Newest Photos</a></li>
						<li><a href="contribPicks.html" style="padding: 0.5rem 0; display: block;">Contributor Picks</a></li>
						<li><a href="photoCalendar.html" style="padding: 0.5rem 0; display: block;">By Date</a></li>
						<li><a href="railroadList.html" style="padding: 0.5rem 0; display: block;">By Railroad</a></li>
						<li><a href="modelList.html" style="padding: 0.5rem 0; display: block;">By Locomotive Model</a></li>
						<li><a href="search.html" style="padding: 0.5rem 0; display: block;">Search</a></li>
					</ul>

					<div id="memberMenu">
						${loggedIn ? `
							<div class="CallOut" style="border-bottom: solid black 1px; margin-top: 1rem; padding: 0.5rem 0;">Members</div>
							<ul class="menu" style="list-style: none; padding: 0;">
								<li><a href="upload.html" style="padding: 0.5rem 0; display: block;">Upload Pictures</a></li>
								<li><a href="view-pictures.html" style="padding: 0.5rem 0; display: block;">View Pictures</a></li>
								<li><a href="manage-pictures.html" style="padding: 0.5rem 0; display: block;">Manage Pictures</a></li>
								<li><a href="#" onclick="handleSignOut()" style="padding: 0.5rem 0; display: block;">Sign Out</a></li>
							</ul>
							<div class="CallOut" style="border-bottom: solid black 1px; margin-top: 1rem; padding: 0.5rem 0;">My Account</div>
							<ul class="menu" style="list-style: none; padding: 0;">
								<li><a href="aboutme.html" style="padding: 0.5rem 0; display: block;">My Profile</a></li>
								<li><a href="my-photos.html" style="padding: 0.5rem 0; display: block;">My Photos</a></li>
								<li><a href="account-settings.html" style="padding: 0.5rem 0; display: block;">Account Settings</a></li>
							</ul>
						` : `
							<div class="CallOut" style="border-bottom: solid black 1px; margin-top: 1rem; padding: 0.5rem 0;">Members</div>
							<ul class="menu" style="list-style: none; padding: 0;">
								<li><a href="login.html" style="padding: 0.5rem 0; display: block;">Log In</a></li>
								<li><a href="register.html" style="padding: 0.5rem 0; display: block;">Register</a></li>
							</ul>
						`}
					</div>
				</div>
			</nav>
			<div class="mainContent" style="flex: 1; padding: 1rem;"></div>
		</div>
		<footer style="border-top: 1px solid #eee; padding: 1rem; margin-top: 0.45rem;">
    		<div class="DefText" style="display: flex; justify-content: space-between;">
       		<div>Railhub Pictures © 2024-2025<br>Photos © respective authors</div>
        		<div>Version 0.2</div>
    		</div>
		</footer>
	`;

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