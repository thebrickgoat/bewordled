<template>
  <div>
    <div class="score-container">
      <h3>Local Scores</h3>
      <template v-if="localHighScores.length > 0">
        <ul>
          <li v-for="(score, index) in localHighScores" :key="score.id">
            <template v-if="index <= 4">
              <span>{{ index + 1 }}</span> : <span class="accent">{{ score }}</span>
            </template>
          </li>
        </ul>
        <button @click="clearScores">Clear Scores</button>
      </template>
      <template v-else>
        <p>no scores yet!</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const localHighScores = ref([])

const getScores = () => {
  const scores = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.includes('bewordled')) {
      const score = JSON.parse(localStorage.getItem(key))
      scores.push(Number(score)) // Convert score to a number
    }
  }
  console.log(scores)
  scores.sort((a, b) => b - a)
  localHighScores.value = scores
  console.log(localHighScores.value)
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
</style>
