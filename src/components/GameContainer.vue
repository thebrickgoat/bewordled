<template>
  <div v-if="gameState === 'playing'">
    <div>
      Score: <span class="accent">{{ score }}</span>
    </div>
    <div>
      Moves: <span class="accent">{{ moves }} / {{ movesLimit }}</span>
    </div>
  </div>
  <div v-else>
    <h2>Game Over</h2>
    <p class="accent">you score was {{ score }}</p>
    <button @click="resetGame">Play Again</button>
  </div>
  <div class="game-board">
    <div class="letter-board">
      <div v-for="(row, rowIndex) in board" :key="`row-${rowIndex}`" class="game-row">
        <div
          v-for="(cell, cellIndex) in row"
          :key="`cell-${cellIndex}`"
          class="game-cell"
          :class="{ selected: cell.selected, matched: cell.matched, fell: cell.fell }"
          @click="() => handleCellClick(rowIndex, cellIndex)"
        >
          {{ cell.letter }}
        </div>
      </div>
    </div>
    <div class="secret-word">
      <div
        class="game-cell"
        v-for="(letter, index) in secretWord"
        :key="`letter-${index}`"
        :class="{ matched: currentLetters.includes(letter) }"
      >
        <template v-if="letter && currentLetters.includes(letter)">{{ letter }}</template>
      </div>
      <div class="score-multiplier">x {{ scoreMultiplier }}</div>
    </div>
  </div>
  <div v-if="showDebug" class="debug">
    <pre>debug window</pre>
    <pre>lastWord: {{ lastWord }}</pre>
    <pre>secret-word: {{ secretWord }}</pre>
    <pre>curentLetters: {{ currentLetters }}</pre>
    <pre>gotWords: {{ gotWords }}</pre>
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
const movesLimit = 5
const gameState = ref('playing')
const lastWord = ref('')
const delayAmount = 1500
const currentLetters = ref([])
const scoreMultiplier = ref(10)
const scoreMultiplierLimit = 100
const scoreMultiplierIncrement = 10
const canClick = ref(true)
const gotWords = ref([])
const showDebug = ref(false)

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

const showDebugWindow = () => {
  showDebug.value = !showDebug.value
}

const boardHasVowel = () => {
  return board.value.some((row) => row.some((cell) => vowels.includes(cell.letterf)))
}

const createCell = (matched = false, fell = false) => {
  return {
    letter: letters.value[Math.floor(Math.random() * letters.value.length)],
    matched,
    fell
  }
}

const ensureVowelSpawn = () => {
  if (!boardHasVowel()) {
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
      checkSecretWord()
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
  let matchLength = 0
  console.log('checking for matches')
  // Check horizontal matches

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize - 2; j++) {
      const word =
        board.value[i][j].letter + board.value[i][j + 1].letter + board.value[i][j + 2].letter
      if (wordlist.includes(word)) {
        // Check if the word contains a shorter word
        let containsShorterWord = false
        for (let k = 0; k < boardSize - 2; k++) {
          if (
            k !== j &&
            wordlist.includes(board.value[i][k].letter + board.value[i][k + 1].letter)
          ) {
            containsShorterWord = true
            break
          }
        }
        if (!containsShorterWord) {
          //update score and word to found words list
          console.log('match found', word)
          board.value[i][j].matched =
            board.value[i][j + 1].matched =
            board.value[i][j + 2].matched =
              true
          matchLength = word.length
          score.value += matchLength
          console.log('added to score', matchLength)
          lastWord.value = word
          gotWords.value.push(word)
          matchFound = true
        }
      }
    }
  }
  // remove matches and check if moves are out
  if (matchFound) {
    removeMatches()
  } else if (moves.value >= movesLimit) {
    gameIsOver()
  }
}

const removeMatches = () => {
  canClick.value = false
  // Introduce a small delay before clearing matches and refilling
  console.log('removing matches')
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
  currentLetters.value = []
  const response = await fetch('https://random-word-api.herokuapp.com/word?lang=es&length=5')
  const data = await response.json()
  secretWord.value = data[0].toLowerCase()
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
    score.value = score.value + 10 * scoreMultiplier.value
    scoreMultiplier.value != scoreMultiplierLimit
      ? (scoreMultiplier.value += scoreMultiplierIncrement)
      : scoreMultiplierLimit
    getSecretWord()
  } else {
    if (scoreMultiplier.value > 1) {
      scoreMultiplier.value -= 1
    }
  }
}
const gameIsOver = () => {
  console.log('game over')
  let key = `bewordled-high-score-${new Date().toISOString()}`
  localStorage.setItem(key, score.value)
  canClick.value = false
  gameState.value = 'over'
}

const resetGame = () => {
  gameState.value = 'playing'
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
</style>
