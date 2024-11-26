function enableLoginBtn() {
    // Enable login button if it exists
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
        loginButton.disabled = false;
    } and this is app.tsx: import './App.css';

import { ClockIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { default as GraphemeSplitter } from 'grapheme-splitter';
import { useEffect, useState } from 'react';
import Div100vh from 'react-div-100vh';

import { AlertContainer } from './components/alerts/AlertContainer';
import { Grid } from './components/grid/Grid';
import { Keyboard } from './components/keyboard/Keyboard';
import { DatePickerModal } from './components/modals/DatePickerModal';
import { InfoModal } from './components/modals/InfoModal';
import { MigrateStatsModal } from './components/modals/MigrateStatsModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { StatsModal } from './components/modals/StatsModal';
import { Navbar } from './components/navbar/Navbar';
import {
  DATE_LOCALE,
  DISCOURAGE_INAPP_BROWSERS,
  LONG_ALERT_TIME_MS,
  MAX_CHALLENGES,
  REVEAL_TIME_MS,
  WELCOME_INFO_MODAL_MS,
} from './constants/settings';
import {
  CORRECT_WORD_MESSAGE,
  DISCOURAGE_INAPP_BROWSER_TEXT,
  GAME_COPIED_MESSAGE,
  HARD_MODE_ALERT_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  SHARE_FAILURE_TEXT,
  WIN_MESSAGES,
  WORD_NOT_FOUND_MESSAGE,
} from './constants/strings';
import { useAlert } from './context/AlertContext';
import { isInAppBrowser } from './lib/browser';
import {
  getStoredIsHighContrastMode,
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
} from './lib/localStorage';
import { addStatsForCompletedGame, loadStats } from './lib/stats';
import {
  findFirstUnusedReveal,
  getGameDate,
  getIsLatestGame,
  isWinningWord,
  isWordInWordList,
  setGameDate,
  solution,
  solutionGameDate,
  unicodeLength,
} from './lib/words';

function App() {
  const isLatestGame = getIsLatestGame();
  const gameDate = getGameDate();
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const { showError: showErrorAlert, showSuccess: showSuccessAlert } = useAlert();
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameWon, setIsGameWon] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [isMigrateStatsModalOpen, setIsMigrateStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentRowClass, setCurrentRowClass] = useState('');
  const [isGameLost, setIsGameLost] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  );
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  );
  const [isRevealing, setIsRevealing] = useState(false);
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame);
    if (loaded?.solution !== solution) {
      return [];
    }
    const gameWasWon = loaded.guesses.includes(solution);
    if (gameWasWon) {
      setIsGameWon(true);
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true);
      showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
        persist: true,
      });
    }
    return loaded.guesses;
  });

  const [stats, setStats] = useState(() => loadStats());

  const [isHardMode, setIsHardMode] = useState(
    localStorage.getItem('gameMode')
      ? localStorage.getItem('gameMode') === 'hard'
      : false
  );

  useEffect(() => {
    // if no game state on load,
    // show the user the how-to info modal
    if (!loadGameStateFromLocalStorage(true)) {
      setTimeout(() => {
        setIsInfoModalOpen(true);
      }, WELCOME_INFO_MODAL_MS);
    }
  }, []);

  useEffect(() => {
    DISCOURAGE_INAPP_BROWSERS &&
      isInAppBrowser() &&
      showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      });
  }, [showErrorAlert]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isDarkMode, isHighContrastMode]);

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const handleHardMode = (isHard: boolean) => {
    if (guesses.length === 0 || localStorage.getItem('gameMode') === 'hard') {
      setIsHardMode(isHard);
      localStorage.setItem('gameMode', isHard ? 'hard' : 'normal');
    } else {
      showErrorAlert(HARD_MODE_ALERT_MESSAGE);
    }
  };

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast);
    setStoredIsHighContrastMode(isHighContrast);
  };

  const clearCurrentRowClass = () => {
    setCurrentRowClass('');
  };

  useEffect(() => {
    saveGameStateToLocalStorage(getIsLatestGame(), { guesses, solution });
  }, [guesses]);

 useEffect(() => {
  if (isGameWon) {
    console.log("Game won! Adding 10 points.");
    window.addScore(10);  // Call the addScore function from scripts.js

    const winMessage =
      WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
    const delayMs = REVEAL_TIME_MS * solution.length;

    showSuccessAlert(winMessage, {
      delayMs,
      onClose: () => setIsStatsModalOpen(true),
    });
  }

  if (isGameLost) {
    setTimeout(() => {
      setIsStatsModalOpen(true);
    }, (solution.length + 1) * REVEAL_TIME_MS);
  }
}, [isGameWon, isGameLost, showSuccessAlert]);


  const onChar = (value: string) => {
    if (
      unicodeLength(<span class="math-inline">\{currentGuess\}</span>{value}) <= solution.length &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(<span class="math-inline">\{currentGuess\}</span>{value});
    }
  };

  const onDelete = () => {
    setCurrentGuess(
      new GraphemeSplitter().splitGraphemes(currentGuess).slice(0, -1).join('')
    );
  };

  const onEnter = () => {
    if (isGameWon || isGameLost) {
      return;
    }

    if (!(unicodeLength(currentGuess) === solution.length)) {
      setCurrentRowClass('jiggle');
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      });
    }

    if (!isWordInWordList(currentGuess)) {
      setCurrentRowClass('jiggle');
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      });
    }

    // enforce hard mode - all guesses must contain all previously revealed letters
    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(currentGuess, guesses);
      if (firstMissingReveal) {
        setCurrentRowClass('jig} 

    function enableSignupBtn() {
    const signupButton = document.getElementById("signupButton");
    if (signupButton) {
        signupButton.disabled = false;
    }
}


document.addEventListener("DOMContentLoaded", function() {

    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    function showMessage(message, type) {
        const messageBox = document.createElement('div');
        messageBox.className = message-box ${type};
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
 const loginButton = document.getElementById("loginButton");
    if (loginButton) {
        loginButton.disabled = true;
    }
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
                localStorage.setItem('score', user.score || 0); // Store the user's score or set default 0
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

        const signUpForm = modal.querySelector('form');
        signUpForm.onsubmit = function(e) {
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

            let users = getStoredUsers(); // Retrieve users from localStorage
            console.log('Users before sign-up:', users);

            if (users.find(user => user.username === username)) {
                showMessage('Username already exists!', 'error');
            } else if (users.find(user => user.email === email)) {
                showMessage('Email already exists!', 'error');
            } else if (password.length < 6) {
                showMessage('Password must be at least 6 characters long', 'error');
            } else {
                // Add the new user with default score of 0
                const newUser = { username, email, password, score: 0 };
                users.push(newUser);
                saveUsers(users); // Save users back to localStorage
                console.log('Users after sign-up:', users);

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUser', username);
                localStorage.setItem('score', 0); // Set default score for the new user
                isLoggedIn = true; // Update the isLoggedIn state

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

        // Fetch the logged in user's score
        const score = localStorage.getItem('score') || 0;

        modalContent.innerHTML = 
            <span class="close">&times;</span>
            <div class="profile-picture-large" style="background-image: url('profile.jfif');"></div>
            <p class="username">${localStorage.getItem('loggedInUser')}</p>
            <p class="score" style="position: relative;">
                <img src="static/media/wl.png" alt="Score Icon" class="score-icon">
                <span class="score-number">${score}</span>
            </p>
            <button class="reset-password-btn">Reset Password</button>
            <button class="logout-btn">Logout</button>
        ;

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
            localStorage.removeItem('score'); // Clear the score when logged out
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
