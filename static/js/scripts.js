let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let loggedInUser = localStorage.getItem('loggedInUser');
let score = parseInt(localStorage.getItem('score'), 10) || 0;

// Function to display messages
function showMessage(message, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);

    setTimeout(() => {
        document.body.removeChild(msgDiv);
    }, 3000);
}

// Function to add score
function addScore(points) {
    score += points;
    localStorage.setItem('score', score);
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${score}`;
    }
}

// Function to render the UI
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

        // Display the score
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${score}`;
        }
    } else {
        loginButton.style.display = 'inline-block';
        signUpButton.style.display = 'inline-block';

        loginButton.onclick = openLoginModal;
        signUpButton.onclick = openSignUpModal;
    }
}

// Function to handle login
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        showMessage('Login successful!', 'success');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', user.username);
        score = user.score || 0;
        localStorage.setItem('score', score);
        isLoggedIn = true;
        renderUI();
    } else {
        showMessage('Incorrect username or password', 'error');
    }
}

// Function to handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    isLoggedIn = false;
    renderUI();
    showMessage('Logged out successfully', 'success');
}

// Function to handle signup
function signUp(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        showMessage('Username already exists', 'error');
        return;
    }
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    users.push({ username, password, score: 0 });
    localStorage.setItem('users', JSON.stringify(users));
    showMessage('Signup successful!', 'success');
}

// Function to show the profile modal
function showProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.innerHTML = `
        <h2>Profile</h2>
        <p>Username: ${loggedInUser}</p>
        <p id="profileScore">Score: ${score}</p>
        <button class="logout-btn">Logout</button>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.logout-btn').onclick = function() {
        logout();
        document.body.removeChild(modal);
    };
}

// Handle game win (update score only once per session)
function handleGameWin() {
    const pointsAdded = localStorage.getItem('pointsAdded');
    if (!pointsAdded) {
        addScore(10);
        localStorage.setItem('pointsAdded', 'true');
        console.log("10 points added to score");
    }
}

// Handle page refresh or game reset
window.addEventListener('load', () => {
    renderUI();

    // Reset the "pointsAdded" flag when the game resets
    if (!isGameWon) {
        localStorage.removeItem('pointsAdded');
    }
});

// Add event listeners for login and signup forms
document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    const username = e.target.username.value.toLowerCase();
    const password = e.target.password.value;
    login(username, password);
};

document.getElementById('signupForm').onsubmit = function(e) {
    e.preventDefault();
    const username = e.target.username.value.toLowerCase();
    const password = e.target.password.value;
    signUp(username, password);
};

