
document.addEventListener("DOMContentLoaded", function() {

    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    function showMessage(message, type) {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        document.body.appendChild(messageBox);

        setTimeout(function() {
            messageBox.classList.add('fade-out');
            setTimeout(function() {
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
    setTimeout(function() {
        modal.querySelector('.modal-content').classList.add('show');
    }, 10);

    modal.querySelector('.close').onclick = function() {
        modal.style.display = 'none';
        modal.querySelector('.modal-content').classList.remove('show');
    };

    modal.querySelector('form').onsubmit = function(e) {
        e.preventDefault();
        let loginValue = document.getElementById('username').value.toLowerCase(); // Convert to lowercase
        const password = document.getElementById('password').value;

        const users = getStoredUsers();
        // Find user by either username or email
        const user = users.find(user => (user.username === loginValue || user.email === loginValue) && user.password === password);

        if (user) {
            showMessage('Login successful!', 'success');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', user.username);  // Store the username in localStorage
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
    setTimeout(function() {
        modal.querySelector('.modal-content').classList.add('show');
    }, 10);

    modal.querySelector('.close').onclick = function() {
        modal.style.display = 'none';
        modal.querySelector('.modal-content').classList.remove('show');
    };

    // Attach the event listener for form submission
    const signUpForm = modal.querySelector('form'); // Ensure you're selecting the correct form
    signUpForm.onsubmit = function(e) {
        e.preventDefault();
        let username = document.getElementById('newUsername').value.toLowerCase(); // Convert to lowercase
        const email = document.getElementById('email').value.toLowerCase(); // Convert to lowercase
        const password = document.getElementById('newPassword').value;

        // Validate username contains only lowercase letters and numbers
        const usernamePattern = /^[a-z0-9]+$/;
        if (!usernamePattern.test(username)) {
            showMessage('Username can only contain lowercase letters and numbers.', 'error');
            return;
        }

        let users = getStoredUsers(); // Retrieve users from localStorage
        console.log('Users before sign-up:', users); // Debugging: Log the current users

        // Check if the username or email already exists
        if (users.find(user => user.username === username)) {
            showMessage('Username already exists!', 'error');
        } else if (users.find(user => user.email === email)) {
            showMessage('Email already exists!', 'error');
        } else if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
        } else {
            // Add the new user to the users array
            const newUser = { username, email, password };
            users.push(newUser);
            saveUsers(users); // Save users back to localStorage
            console.log('Users after sign-up:', users); // Debugging: Log users after sign-up

            // Set user as logged in
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', username);
            isLoggedIn = true; // Update the isLoggedIn state

            // Immediately update the UI
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
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <div class="profile-picture-large" style="background-image: url('profile.jfif');"></div>
            <p class="username">${localStorage.getItem('loggedInUser')}</p>
            <p class="score" style="position: relative;">
                <img src="static/media/wl.png" alt="Score Icon" class="score-icon">
                <span class="score-number">${localStorage.getItem('score')}</span>
            </p>
            <button class="reset-password-btn">Reset Password</button>
            <button class="logout-btn">Logout</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        setTimeout(function() {
            modalContent.classList.add('show');
        }, 10);

        modal.querySelector('.close').onclick = function() {
            document.body.removeChild(modal);
        };

        modal.querySelector('.logout-btn').onclick = function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser');
            isLoggedIn = false;
            renderUI();
            document.body.removeChild(modal);
            showMessage('Logged out successfully', 'success');
        };

        window.onclick = function(event) {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'none';

    document.getElementById('loginBtn').onclick = openLoginModal;
    document.getElementById('signupBtn').onclick = openSignUpModal;

    renderUI();
});
