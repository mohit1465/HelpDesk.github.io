auth.onAuthStateChanged(user => {
    const profileImage = document.querySelector('.profile-header img');
    if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();

                profileImage.style.display = 'none';

                const firstLetter = userData.name.charAt(0).toUpperCase();
                const nameLetterElement = document.getElementById('profile-initial');
                nameLetterElement.textContent = firstLetter;

                document.getElementById('user-name-email').innerHTML = `
                    <h2 style="margin-bottom:0px;" id='userData'>${userData.name}</h2>
                    <p style="margin: 0; margin: 5px 0;" id='userEmail'>Email: ${userData.email}</p>`;

                document.getElementById('auth-check-option').innerHTML = `
                    <button onclick="logoutUser()" class="edit-profile" style="margin: 1px 0;">Logout</button>`;

            

            }
        }).catch(error => {
            console.error('Error fetching user data:', error);
            alert('Error fetching user data.');
        });
    } else {
      profileImage.style.display = 'block';
      document.getElementById('profile-initial').style.display = 'none';
      
        document.getElementById('user-name-email').innerHTML = `
            <h2 id='login-magic' onclick='redirectToLogin()' style='margin-bottom: 0px'>Login to See, <span>Magic</span></h2>`;
        document.getElementById('auth-check-option').innerHTML = `
            <span id="login-signup" onclick="redirectToLogin()" class="edit-profile" style="margin: 8px 0;">Login | signup</span>`;
        document.getElementById('skills-section').style.display = 'none';
    }
});

function logoutUser() {
    auth.signOut().then(() => {
        const currentTheme = body.getAttribute('data-theme');
        localStorage.setItem('currentTheme', currentTheme);
        alert("Logged out successfully!");
        window.location.href = '';
    });
}

function redirectToLogin() {
    const currentTheme = body.getAttribute('data-theme');
    const pageName = window.location.pathname.split("/").pop();
    localStorage.setItem('lastPage', pageName);
    localStorage.setItem('currentTheme', currentTheme);
    window.location.href = 'login-signup.html';
}
