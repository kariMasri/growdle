// Enable login button
function enableLoginBtn() {
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
        loginButton.disabled = false;
    }
}

// Enable signup button
function enableSignupBtn() {
    const signupButton = document.getElementById("signupButton");
    if (signupButton) {
        signupButton.disabled = false;
    }
}

// Show messages for success or error
function showMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.classList.add('fade-out');
        setTimeout(() => document.body.removeChild(messageBox), 1000);
    }, 3000);
}

// Retrieve stored users from localStorage
function getStoredUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Update the UI based on login status
function renderUI() {
    const loginButton = document.getElementById('loginBtn');
    const signUpButton = document.getElementById('signupBtn');
    const rightIcons = document.querySelector('.right-icons');
    const existingProfileButton = document.getElementById('profileBtn');

    if (existingProfileButton) existingProfileButton.remove();

    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginButton.style.display = 'none';
        signUpButton.style.display = 'none';

        const profileButton = document.createElement('button');
        profileButton.className = 'btn profile-btn';
        profileButton.id = 'profileBtn';
        profileButton.style.backgroundImage = "url('profile.jfif')";
        rightIcons.appendChild(profileButton);

        profileButton.onclick = showProfileModal;
    } else {
        loginButton.style.display = 'inline-block';
        signUpButton.style.display = 'inline-block';

        loginButton.onclick = openLoginModal;
        signUpButton.onclick = openSignUpModal;
    }
}

// Open login modal and handle login form submission
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.querySelector('.modal-content').classList.add('show'), 10);

    modal.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
        modal.querySelector('.modal-content').classList.remove('show');
    };

    modal.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        const loginButton = document.getElementById("loginButton");
        if (loginButton) loginButton.disabled = true;

        const usernameInput = document.getElementById('username').value.toLowerCase();
        const passwordInput = document.getElementById('password').value;
        const users = getStoredUsers();
        const user = users.find(
            user => (user.username === usernameInput || user.email === usernameInput) && user.password === passwordInput
        );

        if (user) {
            showMessage('Login successful!', 'success');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', user.username);
            localStorage.setItem('score', user.score || 0);
            renderUI();
            modal.style.display = 'none';
        } else {
            showMessage('Incorrect username/email or password', 'error');
        }
    };
}

// Open sign-up modal and handle sign-up form submission
function openSignUpModal() {
    const modal = document.getElementById('signupModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.querySelector('.modal-content').classList.add('show'), 10);

    modal.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
        modal.querySelector('.modal-content').classList.remove('show');
    };

    const signUpForm = modal.querySelector('form');
    signUpForm.onsubmit = (e) => {
        e.preventDefault();
        const signupButton = document.getElementById("signupButton");
        if (signupButton) signupButton.disabled = true;

        const username = document.getElementById('newUsername').value.toLowerCase();
        const email = document.getElementById('email').value.toLowerCase();
        const password = document.getElementById('newPassword').value;

        const users = getStoredUsers();
        if (!/^[a-z0-9]+$/.test(username)) {
            showMessage('Username can only contain lowercase letters and numbers.', 'error');
        } else if (users.find(user => user.username === username)) {
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
            renderUI();
            showMessage('Sign-up successful!', 'success');
            modal.style.display = 'none';
        }
    };
}

// Display profile modal with user information
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
        localStorage.setItem('isLoggedIn', 'false');
        renderUI();
        document.body.removeChild(modal);
    };
}

// Adding score when the game is won
window.addScore = (points) => {
    const currentScore = parseInt(localStorage.getItem('score') || '0');
    const newScore = currentScore + points;
    localStorage.setItem('score', newScore);
    renderUI();
};

// Initialize UI on page load
document.addEventListener("DOMContentLoaded", renderUI);
