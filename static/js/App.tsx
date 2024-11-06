import './App.css';

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
      unicodeLength(`<span class="math-inline">\{currentGuess\}</span>{value}`) <= solution.length &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`<span class="math-inline">\{currentGuess\}</span>{value}`);
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
        setCurrentRowClass('jig
