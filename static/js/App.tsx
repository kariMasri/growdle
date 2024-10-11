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
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * solution.length

      // Update score only on game win
      let currentScore = parseInt(localStorage.getItem('score') || '0', 10)
      currentScore += 10
      localStorage.setItem('score', currentScore.toString())
      setScore(currentScore)

      console.log(`Score updated! New score: ${currentScore}`)
    }
  }, [isGameWon])

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

      {/* Only show StatsModal if game is NOT won or lost */}
      {!isGameWon && !isGameLost && (
        <StatsModal isGameWon={isGameWon} isGameLost={isGameLost} />
      )}

      <p>Your Score: {score}</p> {/* Display the score */}
    </div>
  )
}

export default App
