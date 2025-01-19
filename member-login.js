				function updateMemberMenu() {
					const memberMenuElement = document.getElementById('memberMenu');
	
					if (loggedIn) {
						memberMenuElement.innerHTML = `
							<div class="CallOut" style="border-bottom: solid black 1px; margin-top: 1rem; padding: 0.5rem 0;">Members</div>
							<ul class="menu" style="list-style: none; padding: 0;">
								<li><a href="upload.html" style="padding: 0.5rem 0; display: block;">Upload Pictures</a></li>
								<li><a href="view-pictures.html" style="padding: 0.5rem 0; display: block;">View Pictures</a></li>
								<li><a href="manage-pictures.html" style="padding: 0.5rem 0; display: block;">Manage Pictures</a></li>
								<li><a href="#" onclick="confirmLogout()" style="padding: 0.5rem 0; display: block;">Sign Out</a></li>
							</ul>
							<div class="CallOut" style="border-bottom: solid black 1px; margin-top: 1rem; padding: 0.5rem 0;">My Account</div>
							<ul class="menu" style="list-style: none; padding: 0;">
								<li><a href="aboutme.html" style="padding: 0.5rem 0; display: block;">My Profile</a></li>
								<li><a href="my-photos.html" style="padding: 0.5rem 0; display: block;">My Photos</a></li>
								<li><a href="account-settings.html" style="padding: 0.5rem 0; display: block;">Account Settings</a></li>
							</ul>
						`;
					} else {
						memberMenuElement.innerHTML = `
							<div class="CallOut" style="border-bottom: solid black 1px; margin-top: 1rem; padding: 0.5rem 0;">Members</div>
							<ul class="menu" style="list-style: none; padding: 0;">
								<li><a href="login.html" style="padding: 0.5rem 0; display: block;">Log In</a></li>
								<li><a href="register.html" style="padding: 0.5rem 0; display: block;">Register</a></li>
							</ul>
						`;
					}
				}

				// Call the function when the page loads
				document.addEventListener('DOMContentLoaded', updateMemberMenu);	