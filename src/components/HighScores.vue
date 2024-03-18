<template>
  <div>
    <div class="score-container">
      <h3>Local High Scores</h3>
      <template v-if="localHighScores.length > 0">
        <ul>
          <li v-for="(score, index) in localHighScores" :key="score.id">
            <span>{{ index + 1 }}</span> : <span class="accent">{{ score }}</span>
          </li>
        </ul>
        <div class="button-container">
          <button @click="clearScores">Clear Scores</button>
          <button @click="showPopup = true">How To Play</button>
        </div>

      </template>
      <template v-else>
        <p>no scores yet!</p>
      </template>
    </div>
  </div>
  <Transition name="fade">

    <div class="popup" v-if="showPopup">
      <div class="popup-content">
        <h2>How To Play</h2>
        <p>
          click a letter and then click another letter in the square up, down, left or
          right of it to swap letters and make words 3 to 5 letters long to earn points. Longer words
          are worth more points. When you get a word, any letters in that word that are in the secret
          word will fill in, and if you complete the secret word you will gain points equal to a 5
          letter word times the multiplier. The multipler will decrese with every match until the
          secret word is found, and increse by 10 for every secret word found.
        </p>
        <button @click="showPopup = false">Close</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const localHighScores = ref([])
const showPopup = ref(false)

const getScores = () => {
  const scores = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.includes('bewordled')) {
      const score = JSON.parse(localStorage.getItem(key))
      scores.push(Number(score)) // Convert score to a number
    }
  }
  scores.sort((a, b) => b - a)
  localHighScores.value = scores.slice(0, 5) // Only keep the top 5 scores
  deleteOtherScores(scores.slice(5)) // Delete other scores
}

const deleteOtherScores = (scores) => {
  for (const score of scores) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.includes('bewordled')) {
        const storedScore = JSON.parse(localStorage.getItem(key))
        if (Number(storedScore) === score) {
          localStorage.removeItem(key)
          break
        }
      }
    }
  }
}

const clearScores = () => {
  localHighScores.value = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.includes('bewordled')) {
      localStorage.removeItem(key)
    }
  }
}

onMounted(() => {
  getScores()
})
</script>

<style scoped>
.score-container {
  margin-bottom: 1rem;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  width: fit-content;

}

.popup {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  transition: opacity 0.5s;
}

.popup-content {
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  overflow: auto;
  width: auto;
  margin: auto 2rem ;
}

@media (min-width: 1024px) {
  .popup-content {
    width: 50%;
  }
}

.popup-content h2 {
  color: var(--color-accent);
  text-transform: uppercase;
  font-weight: 900;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.popup-content p {
  margin-bottom: 2rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h3 {
  margin: 0;
  font-size: 1rem;
  border-bottom: 1px solid var(--color-text);
  font-weight: 900;
  text-transform: uppercase;
  padding-bottom: 0.25rem;
  color: var(--color-accent);
}

p {
  margin-top: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
