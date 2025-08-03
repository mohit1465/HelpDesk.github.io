// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, duration);

    // Add click to dismiss
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    });
}

// Confirmation Toast System
function showConfirmToast(message, onConfirm, onCancel = null) {
    return new Promise((resolve) => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.error('Toast container not found');
            resolve(false);
            return;
        }

        const confirmToast = document.createElement('div');
        confirmToast.className = 'toast confirm-toast';
        
        confirmToast.innerHTML = `
            <div class="confirm-message">${message}</div>
            <div class="confirm-buttons">
                <button class="confirm-btn confirm-yes">Yes</button>
                <button class="confirm-btn confirm-no">No</button>
            </div>
        `;

        // Add toast to container
        toastContainer.appendChild(confirmToast);

        const yesBtn = confirmToast.querySelector('.confirm-yes');
        const noBtn = confirmToast.querySelector('.confirm-no');

        function removeToast() {
            if (confirmToast.parentNode) {
                confirmToast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (confirmToast.parentNode) {
                        toastContainer.removeChild(confirmToast);
                    }
                }, 300);
            }
        }

        function handleConfirm() {
            removeToast();
            if (onConfirm) onConfirm();
            resolve(true);
        }

        function handleCancel() {
            removeToast();
            if (onCancel) onCancel();
            resolve(false);
        }

        // Button event listeners
        yesBtn.addEventListener('click', handleConfirm);
        noBtn.addEventListener('click', handleCancel);

        // Click outside to cancel
        function handleOutsideClick(e) {
            if (!confirmToast.contains(e.target)) {
                handleCancel();
                document.removeEventListener('click', handleOutsideClick);
            }
        }

        // Add outside click listener after a short delay to prevent immediate trigger
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);

        // Auto-remove event listener when toast is removed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && !toastContainer.contains(confirmToast)) {
                    document.removeEventListener('click', handleOutsideClick);
                    observer.disconnect();
                }
            });
        });
        observer.observe(toastContainer, { childList: true });
    });
}

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
            showToast('Error fetching user data.', 'error');
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
        showToast('Logged out successfully!', 'success');
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
