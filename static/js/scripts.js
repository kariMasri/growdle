function enableLoginBtn() {
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
        loginButton.disabled = false;
    }
}

function enableSignupBtn() {
    const signupButton = document.getElementById("signupButton");
    if (signupButton) {
        signupButton.disabled = false;
    }
}

function addScore(points) {
    const currentScore = parseInt(localStorage.getItem('score') || '0');
    const newScore = currentScore + points;
    localStorage.setItem('score', newScore);
    console.log('Score updated:', newScore);
    renderUI(); // Update UI if necessary
}

// Expose the function globally
window.addScore = addScore;

document.addEventListener("DOMContentLoaded", function() {
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    function showMessage(message, type) {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        document.body.appendChild(messageBox);

        setTimeout(() => {
            messageBox.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 1000);
        }, 3000);
    }

    function getStoredUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function renderUI() {
        const loginButton = document.getElementById('loginBtn');
        const signUpButton = document.getElementById('signupBtn');
        const rightIcons = document.querySelector('.right-icons');

        const existingProfileButton = document.getElementById('profileBtn');
        if (existingProfileButton) {
            existingProfileButton.remove();
        }

        if (isLoggedIn) {
            loginButton.style.display = 'none';
            signUpButton.style.display = 'none';

            const profileButton = document.createElement('button');
            profileButton.className = 'btn profile-btn';
            profileButton.id = 'profileBtn';
            profileButton.style.backgroundImage = "url('profile.jfif')";
            rightIcons.appendChild(profileButton);

            profileButton.onclick = function() {
                showProfileModal();
            };
        } else {
            loginButton.style.display = 'inline-block';
            signUpButton.style.display = 'inline-block';

            loginButton.onclick = openLoginModal;
            signUpButton.onclick = openSignUpModal;
        }
    }

    function openLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.querySelector('.modal-content').classList.add('show'), 10);

        modal.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
            modal.querySelector('.modal-content').classList.remove('show');
        };

        modal.querySelector('form').onsubmit = function(e) {
            const loginButton = document.getElementById("loginButton");
            if (loginButton) {
                loginButton.disabled = true;
            }
            e.preventDefault();

            const loginValue = document.getElementById('username').value.toLowerCase();
            const password = document.getElementById('password').value;
            const users = getStoredUsers();

            const user = users.find(user => 
                (user.username === loginValue || user.email === loginValue) && user.password === password
            );

            if (user) {
                showMessage('Login successful!', 'success');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUser', user.username);
                localStorage.setItem('score', user.score || 0);
                isLoggedIn = true;
                renderUI();
                modal.style.display = 'none';
            } else {
                showMessage('Incorrect username/email or password', 'error');
            }
        };
    }

    function openSignUpModal() {
        const modal = document.getElementById('signupModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.querySelector('.modal-content').classList.add('show'), 10);

        modal.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
            modal.querySelector('.modal-content').classList.remove('show');
        };

        modal.querySelector('form').onsubmit = function(e) {
            const signupButton = document.getElementById("signupButton");
            if (signupButton) {
                signupButton.disabled = true;
            }
            e.preventDefault();

            const username = document.getElementById('newUsername').value.toLowerCase();
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('newPassword').value;

            if (!/^[a-z0-9]+$/.test(username)) {
                showMessage('Username can only contain lowercase letters and numbers.', 'error');
                return;
            }

            const users = getStoredUsers();

            if (users.find(user => user.username === username)) {
                showMessage('Username already exists!', 'error');
            } else if (users.find(user => user.email === email)) {
                showMessage('Email already exists!', 'error');
            } else if (password.length < 6) {
                showMessage('Password must be at least 6 characters long', 'error');
            } else {
                const newUser = { username, email, password, score: 0 };
                users.push(newUser);
                saveUsers(users);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUser', username);
                localStorage.setItem('score', 0);
                isLoggedIn = true;

                renderUI();
                showMessage('Sign-up successful!', 'success');
                modal.style.display = 'none';
            }
        };
    }

    function showProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'profileModal';
        modal.style.display = 'flex';

        const modalContent = document.createElement('div');
        modalContent.className = 'profile-modal-content';

        const score = localStorage.getItem('score') || 0;

        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <div class="profile-picture-large" style="background-image: url('profile.jfif');"></div>
            <p class="username">${localStorage.getItem('loggedInUser')}</p>
            <p class="score">
                <img src="static/media/wl.png" alt="Score Icon" class="score-icon">
                <span class="score-number">${score}</span>
            </p>
            <button class="reset-password-btn">Reset Password</button>
            <button class="logout-btn">Logout</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        setTimeout(() => modalContent.classList.add('show'), 10);

        modal.querySelector('.close').onclick = () => document.body.removeChild(modal);

        modal.querySelector('.logout-btn').onclick = () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('score');
            isLoggedIn = false;
            renderUI();
            document.body.removeChild(modal);
            showMessage('Logged out successfully', 'success');
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    renderUI();
});
