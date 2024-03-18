<template>
  <div class="game" v-if="gameState === 'playing'">
    <div class="scores">
      <div>
        Score: <span class="accent">{{ score }}</span>
        <span :class="showPointsDialog ? 'fade-slide-out' : 'hidden'"> + {{ pointsDialog }}</span>
      </div>
      <div>
        Moves: <span class="accent">{{ moves }} / {{ movesLimit }}</span>
      </div>
    </div>
    <div class="game-board">
      <div class="letter-board">
        <div v-for="(row, rowIndex) in board" :key="`row-${rowIndex}`" class="game-row">
          <div v-for="(cell, cellIndex) in row" :key="`cell-${cellIndex}`" class="game-cell"
            :class="{ selected: cell.selected, matched: cell.matched, fell: cell.fell }"
            @click="() => handleCellClick(rowIndex, cellIndex)">
            {{ cell.letter }}
          </div>
        </div>
      </div>
      <div class="secret-word">
        <div class="game-cell" v-for="(letter, index) in secretWord" :key="`letter-${index}`"
          :class="{ matched: currentLetters.includes(letter), solved: currentLetters.length >= 5 }">
          <template v-if="letter && currentLetters.includes(letter)">{{ letter }}</template>
        </div>
        <div class="score-multiplier">x {{ scoreMultiplier }}</div>
      </div>
    </div>
    <div class="got-words">
      <template v-for="(word, i) in gotWords" :key="word">
        <div class="tag" v-if="i > gotWords.length - 10 ">{{ word }}</div><span v-if="i == gotWords.length - 1 && i > 10">...</span>
      </template>
    </div>
  </div>
  <div class="game-over" v-else :class="gameState == 'over' ? 'fade-in' : ''">
    <h2>Game Over</h2>
    <p>you score was {{ score }}</p>
    <button @click="resetGame">Play Again</button>
  </div>
</template>

<script setup>
import { wordlist } from '@/assets/words'
import { ref, onMounted, nextTick } from 'vue'

const boardSize = 6
const letters = ref([])
const vowels = ['a', 'e', 'i', 'o', 'u']
const board = ref([])
const score = ref(0)
const secretWord = ref('')
const moves = ref(0)
const movesLimit = 50
const gameState = ref('playing')
const lastWord = ref('')
const delayAmount = 1500
const currentLetters = ref([])
const scoreMultiplier = ref(10)
const scoreMultiplierLimit = 100
const scoreMultiplierIncrement = 10
const canClick = ref(true)
const gotWords = ref([])
const pointsDialog = ref(0)
const showPointsDialog = ref(false)

const initBoard = () => {
  getSecretWord()
  letters.value = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))
  for (let i = 0; i < boardSize; i++) {
    board.value[i] = []
    for (let j = 0; j < boardSize; j++) {
      board.value[i][j] = createCell()
    }
  }
  updateCellStatus()
}

const createCell = (matched = false, fell = false) => {
  return {
    letter: letters.value[Math.floor(Math.random() * letters.value.length)],
    matched,
    fell
  }
}

const boardHasVowel = () => {
  return board.value.some((row) => row.some((cell) => vowels.includes(cell.letter)))
}

const ensureVowelSpawn = () => {
  if (!boardHasVowel()) {
    console.log('spawning vowel')
    const randomCol = Math.floor(Math.random() * boardSize)
    board.value[0][randomCol] = createVowelCell()
  }
}

const createVowelCell = () => {
  const randomVowel = vowels[Math.floor(Math.random() * vowels.length)]
  return { letter: randomVowel, matched: false, fell: true }
}

const areCellsAdjacent = (row1, col1, row2, col2) => {
  return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1
}

const handleCellClick = async (rowIndex, cellIndex) => {
  if (!canClick.value) return
  console.log('click')
  const selectedCell = board.value.flat().find((cell) => cell.selected)
  if (selectedCell) {
    if (areCellsAdjacent(rowIndex, cellIndex, selectedCell.row, selectedCell.column)) {
      moves.value++
      // Swap logic
      let tempLetter = board.value[rowIndex][cellIndex].letter
      board.value[rowIndex][cellIndex].letter =
        board.value[selectedCell.row][selectedCell.column].letter
      board.value[selectedCell.row][selectedCell.column].letter = tempLetter
      await nextTick()
      checkForMatches()
    }
    board.value[selectedCell.row][selectedCell.column].selected = false
  } else {
    board.value[rowIndex][cellIndex].selected = true
    board.value[rowIndex][cellIndex].row = rowIndex
    board.value[rowIndex][cellIndex].column = cellIndex
  }
}

const checkForMatches = () => {
  let matchFound = false
  let points = 0
  // Check horizontal matches for 3 to 5-letter words
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      // Start checking from the first column
      for (let wordLength = 3; wordLength <= 5; wordLength++) {
        // Check for word lengths from 3 to 5
        if (j + wordLength <= boardSize) {
          // Ensure the word doesn't go beyond the board
          const word = board.value[i]
            .slice(j, j + wordLength)
            .map((cell) => cell.letter)
            .join('')
          if (wordlist.includes(word)) {
            // Found a valid word, mark cells as matched
            for (let k = 0; k < wordLength; k++) {
              board.value[i][j + k].matched = true
            }
            lastWord.value = word // Update the last found word
            if (!gotWords.value.includes(word)) {
              gotWords.value.push(word) // Add new word to the found words list
            }
            matchFound = true
            points += wordLength
            // Break after finding the longest word starting from this cell
            break
          }
        }
      }
    }
  }

  if (matchFound) {
    removeMatches(points)
    checkSecretWord()
  } else if (moves.value >= movesLimit) {
    gameIsOver()
  }
}

const removeMatches = (points) => {
  canClick.value = false
  increaseScore(points)
  // Introduce a small delay before clearing matches and refilling
  setTimeout(() => {
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board.value[i][j].matched) {
          for (let k = i; k > 0; k--) {
            board.value[k][j] = board.value[k - 1][j]
          }
          board.value[0][j] = createCell()
        }
      }
    }
    canClick.value = true

    // Recursively check for new matces after the board has been updated
    checkForMatches()

    // Call this function at the end of your removeMatches method, possibly with a delay if needed
    setTimeout(() => {
      ensureVowelSpawn()
      updateCellStatus()
    }, 100) // Adjust the timing as needed based on your animation
  }, delayAmount) // 500ms delay
}

const updateCellStatus = () => {
  board.value.forEach((row) => {
    row.forEach((cell) => {
      cell.fell = true
    })
  })
}

const getSecretWord = async () => {
  const secretWords = wordlist.filter((word) => word.length == 5)
  secretWord.value = secretWords[Math.floor(Math.random() * secretWords.length)]
}

const checkSecretWord = () => {
  const lastLetters = lastWord.value.split('')
  const secretLetters = secretWord.value.split('')
  const commonLetters = lastLetters.filter((letter) => secretLetters.includes(letter))

  for (const letter of commonLetters) {
    if (!currentLetters.value.includes(letter)) {
      currentLetters.value.push(letter)
    }
  }

  if (secretLetters.every((letter) => currentLetters.value.includes(letter))) {
    canClick.value = false
    increaseScore(scoreMultiplier.value)
    scoreMultiplier.value != scoreMultiplierLimit
      ? (scoreMultiplier.value += scoreMultiplierIncrement)
      : scoreMultiplierLimit
    setTimeout(() => {
      canClick.value = true;
      currentLetters.value = []
      getSecretWord()
    }, delayAmount);
  } else {
    if (scoreMultiplier.value > 1) {
      scoreMultiplier.value -= 1
    }
  }
}

const increaseScore = (x) => {
  pointsDialog.value = 1 * x
  showPointsDialog.value = true
  score.value += 1 * x
  setTimeout(() => {
    showPointsDialog.value = false
  }, 1000)
}

const gameIsOver = () => {
  const newKey = `bewordled-high-score-${new Date().toISOString()}`
  if (localStorage.length >= 5) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.includes('bewordled')) {
        score.value > Number(localStorage.getItem(key))
          ? localStorage.removeItem(key) && localStorage.setItem(newKey, score.value)
          : null
        return
      }
    }
  }

  canClick.value = false
  gameState.value = 'over'
}

const resetGame = () => {
  gameState.value = 'playing'
  currentLetters.value = []
  canClick.value = true
  gotWords.value = []
  score.value = 0
  moves.value = 0
  scoreMultiplier.value = 10
  initBoard()
}

onMounted(initBoard)
</script>

<style>
.game {}

.game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 2rem;
  animation: fade-in 1s ease forwards;
  text-align: center;
}

.game-over h2 {
  color: var(--color-accent);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 3rem;
  margin-bottom: 1rem;
}

.game-over p {
  margin-bottom: 1rem;
}

.got-words {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-end;
}

.letter-board {
  display: flex;
  flex-direction: column;
  margin: 20px auto;
  overflow: hidden;
}

.secret-word {
  display: flex;
  flex-direction: row;
  margin: 20px auto;
  align-items: center;
}

.secret-word div {
  margin: 5px;
}

.secret-word div:first-child {
  margin-left: 0;
}

.secret-word div:last-child {
  margin-right: 0;
}

.game-row {
  display: flex;
}

.game-cell {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-text);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
  position: relative;
  font-weight: 900;
}

.game-cell.selected {
  color: white;
  background-color: red;
}

.game-cell.matched {
  color: white;
  background-color: var(--color-accent);
}

.letter-board .game-cell {
  transform: translateY(-40px);
}

.game-cell.fell {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.debug {
  position: fixed;
  margin: 2rem;
  padding: 2rem;
  top: 0;
  right: 0;
  border: 1px solid var(--color-text);
}

.matched {
  background-color: var(--color-accent);
  transition: all 0.3s ease;
}

.score-multiplier {
  color: var(--color-accent);
  font-weight: 900;
}

.accent {
  color: var(--color-accent);
  font-weight: 900;
}

.tag {
  background-color: var(--color-accent);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

@keyframes fadeSlideOut {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  50% {
    opacity: 1;
    transform: translateY(0px);
  }

  75% {
    opacity: 1;
    transform: translateY(0px);
  }

  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(25px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes blink {
  0% {
    opacity: .5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: .5;
  }
}
.fade-slide-out {
  margin-left: 0.25rem;
  position: absolute;
  animation: fadeSlideOut 1s ease forwards;
}

.fade-in {
  animation: fade-in 1s ease forwards;
}

.solved{
  animation: blink .5s ease forwards infinite;
}
.hidden {
  display: none;
}
</style>
