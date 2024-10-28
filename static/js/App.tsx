import './App.css'
import { useEffect, useState } from 'react'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { Navbar } from './components/navbar/Navbar'
import { StatsModal } from './components/modals/StatsModal'
import {
  MAX_CHALLENGES,
  REVEAL_TIME_MS,
} from './constants/settings'
import {
  WIN_MESSAGES,
  CORRECT_WORD_MESSAGE,
} from './constants/strings'
import { useAlert } from './context/AlertContext'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
} from './lib/localStorage'
import {
  getGameDate,
  getIsLatestGame,
  isWinningWord,
  solution,
  unicodeLength,
} from './lib/words'

function App() {
  const { showError: showErrorAlert } = useAlert()
  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false) // Track modal visibility
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage(getIsLatestGame())
    if (loaded?.solution !== solution) {
      return []
    }
    const gameWasWon = loaded.guesses.includes(solution)
    if (gameWasWon) setIsGameWon(true)
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(solution), { persist: true })
    }
    return loaded.guesses
  })

  const [score, setScore] = useState<number>(() => {
    const storedScore = localStorage.getItem('score')
    return storedScore ? parseInt(storedScore) : 0
  })

  useEffect(() => {
    saveGameStateToLocalStorage(getIsLatestGame(), { guesses, solution })
  }, [guesses])

  useEffect(() => {
    if (isGameWon) {
      console.log("Game won detected, updating score.")
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * solution.length

      // Increment the score by 10 and save to local storage
      let currentScore = parseInt(localStorage.getItem('score') || '0', 10)
      currentScore += 10
      localStorage.setItem('score', currentScore.toString())
      setScore(currentScore) // Update the score state in the app

      console.log(`Score updated! New score: ${currentScore}`)
      setShowStatsModal(false) // Explicitly set modal visibility to false
    }
  }, [isGameWon])

  useEffect(() => {
    if (isGameLost) {
      setShowStatsModal(false) // Prevent modal from opening on game loss
    }
  }, [isGameLost])

  const onChar = (value: string) => {
    if (
      unicodeLength(`${currentGuess}${value}`) <= solution.length &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
    if (isGameWon || isGameLost) return

    if (unicodeLength(currentGuess) !== solution.length) {
      showErrorAlert('Not enough letters')
      return
    }

    if (!isWinningWord(currentGuess)) {
      showErrorAlert('Word not found')
      return
    }

    const winningWord = isWinningWord(currentGuess)
    setGuesses([...guesses, currentGuess])
    setCurrentGuess('')

    if (winningWord) {
      setIsGameWon(true)
    } else if (guesses.length === MAX_CHALLENGES - 1) {
      setIsGameLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(solution))
    }
  }

  return (
    <div>
      <Navbar />
      <Grid solution={solution} guesses={guesses} currentGuess={currentGuess} />
      <Keyboard onChar={onChar} onDelete={onDelete} onEnter={onEnter} />

      {/* Only show StatsModal if the modal state is true */}
      {showStatsModal && <StatsModal isGameWon={isGameWon} isGameLost={isGameLost} />}

      <p>Your Score: {score}</p> {/* Display the score */}
    </div>
  )
}

export default App
