import { useEffect, useState } from 'react'
import Div100vh from 'react-div-100vh'
import { AlertContainer } from './components/alerts/AlertContainer'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { DatePickerModal } from './components/modals/DatePickerModal'
import { InfoModal } from './components/modals/InfoModal'
import { MigrateStatsModal } from './components/modals/MigrateStatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { StatsModal } from './components/modals/StatsModal'
import { Navbar } from './components/navbar/Navbar'
import {
  WIN_MESSAGES,
  CORRECT_WORD_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
} from './constants/strings'
import { useAlert } from './context/AlertContext'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
} from './lib/localStorage'
import {
  addStatsForCompletedGame,
  loadStats,
} from './lib/stats'
import {
  getGameDate,
  getIsLatestGame,
  isWinningWord,
  isWordInWordList,
  solution,
  unicodeLength,
} from './lib/words'

function App() {
  const isLatestGame = getIsLatestGame()
  const gameDate = getGameDate()
  const { showError: showErrorAlert, showSuccess: showSuccessAlert } = useAlert()

  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame)
    if (loaded?.solution !== solution) return []
    const gameWasWon = loaded.guesses.includes(solution)
    if (gameWasWon) setIsGameWon(true)
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(solution), { persist: true })
    }
    return loaded.guesses
  })
  const [score, setScore] = useState<number>(parseInt(localStorage.getItem('score') || '0', 10))
  const [stats, setStats] = useState(() => loadStats())
  
  // Save game state
  useEffect(() => {
    saveGameStateToLocalStorage(isLatestGame, { guesses, solution })
  }, [guesses])

  // Handle win condition: add score and show success message without opening stats modal
  useEffect(() => {
    if (isGameWon) {
      const winMessage = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      showSuccessAlert(winMessage, { delayMs: 2000 })

      setScore(prevScore => {
        const newScore = prevScore + 10
        localStorage.setItem('score', newScore.toString())
        return newScore
      })
    }
  }, [isGameWon, showSuccessAlert])

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
      showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE)
      return
    }

    if (!isWordInWordList(currentGuess)) {
      showErrorAlert(WORD_NOT_FOUND_MESSAGE)
      return
    }

    const winningWord = isWinningWord(currentGuess)
    if (winningWord) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')
      setIsGameWon(true)
    } else if (guesses.length === MAX_CHALLENGES - 1) {
      setIsGameLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(solution), { persist: true })
    } else {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')
    }
  }

  return (
    <Div100vh>
      <div className="flex h-full flex-col">
        <Navbar />
        <div className="mx-auto flex w-full grow flex-col px-1 pt-2 pb-8 sm:px-6 md:max-w-7xl lg:px-8">
          <div className="flex grow flex-col justify-center">
            <p>Score: {score}</p>
            <Grid solution={solution} guesses={guesses} currentGuess={currentGuess} />
          </div>
          <Keyboard onChar={onChar} onDelete={onDelete} onEnter={onEnter} />
          <InfoModal isOpen={isInfoModalOpen} handleClose={() => setIsInfoModalOpen(false)} />
          <StatsModal isOpen={isStatsModalOpen} handleClose={() => setIsStatsModalOpen(false)} />
          <AlertContainer />
        </div>
      </div>
    </Div100vh>
  )
}

export default App
