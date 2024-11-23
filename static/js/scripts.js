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
    const gameWon = localStorage.getItem('gameWon');
    if (gameWon === 'true') {
        console.warn("Score already added for the current game.");
        return;
    }

    const currentScore = parseInt(localStorage.getItem('score') || '0');
    const newScore = currentScore + points;
    localStorage.setItem('score', newScore);

    // Mark that the score has been updated
    localStorage.setItem('gameWon', 'true');

    console.log(`${points} points added to score`);
    if (typeof renderUI === "function") {
        renderUI();
    } else {
        console.error("renderUI is not defined or accessible.");
    }
}

function initializeNewGame() {
    // Reset game-related flags and states
    localStorage.setItem('gameWon', 'false');
    console.log("New game initialized");
    // Add other initialization logic if needed...
}

document.addEventListener("DOMContentLoaded", function () {
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    function showMessage(message, type) {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        document.body.appendChild(messageBox);

        setTimeout(function () {
            messageBox.classList.add('fade-out');
            setTimeout(function () {
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

            profileButton.onclick = function () {
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
        setTimeout(function () {
            modal.querySelector('.modal-content').classList.add('show');
        }, 10);

        modal.querySelector('.close').onclick = function () {
            modal.style.display = 'none';
            modal.querySelector('.modal-content').classList.remove('show');
        };

        modal.querySelector('form').onsubmit = function (e) {
            const loginButton = document.getElementById("loginButton");
            if (loginButton) {
                loginButton.disabled = true;
            }
            e.preventDefault();
            let loginValue = document.getElementById('username').value.toLowerCase(); // Convert to lowercase
            const password = document.getElementById('password').value;

            const users = getStoredUsers();
            const user = users.find(user => (user.username === loginValue || user.email === loginValue) && user.password === password);

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
        setTimeout(function () {
            modal.querySelector('.modal-content').classList.add('show');
        }, 10);

        modal.querySelector('.close').onclick = function () {
            modal.style.display = 'none';
            modal.querySelector('.modal-content').classList.remove('show');
        };

        const signUpForm = modal.querySelector('form');
        signUpForm.onsubmit = function (e) {
            const signupButton = document.getElementById("signupButton");
            if (signupButton) {
                signupButton.disabled = true;
            }
            e.preventDefault();
            let username = document.getElementById('newUsername').value.toLowerCase(); // Convert to lowercase
            const email = document.getElementById('email').value.toLowerCase(); // Convert to lowercase
            const password = document.getElementById('newPassword').value;

            const usernamePattern = /^[a-z0-9]+$/;
            if (!usernamePattern.test(username)) {
                showMessage('Username can only contain lowercase letters and numbers.', 'error');
                return;
            }

            let users = getStoredUsers();
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

    renderUI();
});
