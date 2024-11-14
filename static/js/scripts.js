// Initialize UI and app state
document.addEventListener('DOMContentLoaded', () => {
    initScore();
    initLoginStatus();
    setupEventListeners();
    renderUI();
});

// Initialize the score in localStorage if it doesn't exist
function initScore() {
    if (!localStorage.getItem('score')) {
        localStorage.setItem('score', '0');
    }
}

// Initialize login status or any required setup for login
function initLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    toggleLoginUI(isLoggedIn);
}

// Add score and update the UI
function addScore(points) {
    const currentScore = parseInt(localStorage.getItem('score') || '0');
    const newScore = currentScore + points;
    localStorage.setItem('score', newScore);
    renderUI(); // Update UI after score change
}

// Render UI elements based on the app's state
function renderUI() {
    const scoreElement = document.getElementById('score');
    const currentScore = localStorage.getItem('score') || '0';
    scoreElement.textContent = `Score: ${currentScore}`;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    toggleLoginUI(isLoggedIn);
}

// Update UI based on login status
function toggleLoginUI(isLoggedIn) {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const profileButton = document.getElementById('profileButton');

    if (isLoggedIn) {
        loginButton.style.display = 'none';
        signupButton.style.display = 'none';
        profileButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        signupButton.style.display = 'block';
        profileButton.style.display = 'none';
    }
}

// Set up event listeners for buttons and other elements
function setupEventListeners() {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const profileButton = document.getElementById('profileButton');

    loginButton.addEventListener('click', handleLogin);
    signupButton.addEventListener('click', handleSignup);
    profileButton.addEventListener('click', showProfileModal);
}

// Handle login functionality
function handleLogin() {
    // Implement your login logic here
    // Set `isLoggedIn` in localStorage if login is successful
    localStorage.setItem('isLoggedIn', 'true');
    renderUI();
}

// Handle signup functionality
function handleSignup() {
    // Implement your signup logic here
    // Set `isLoggedIn` in localStorage if signup is successful
    localStorage.setItem('isLoggedIn', 'true');
    renderUI();
}

// Display profile modal
function showProfileModal() {
    const profileModal = document.getElementById('profileModal');
    profileModal.style.display = 'block';
    updateProfileModal();
}

// Update profile modal content
function updateProfileModal() {
    const usernameElement = document.getElementById('username');
    const scoreElement = document.getElementById('modalScore');

    const username = localStorage.getItem('username') || 'Guest';
    const score = localStorage.getItem('score') || '0';

    usernameElement.textContent = `Username: ${username}`;
    scoreElement.textContent = `Score: ${score}`;
}

// Reset score for debugging or new games
function resetScore() {
    localStorage.setItem('score', '0');
    renderUI();
}

// Make the `addScore` function globally accessible for React to use
window.addScore = addScore;
