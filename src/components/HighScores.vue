<template>
  <div>
    <div class="score-container">
      <h3>Global</h3>
      <ul>
        <li>error fetching scores</li>
      </ul>
      <h3>Local</h3>
      <ul>
        <li v-for="(score, index) in highScores" :key="score.id">
          <span>{{ index + 1 }}</span> : <span>{{ score }}</span>
        </li>
      </ul>
    </div>
    <button @click="clearScores">Clear Scores</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
  console.log(scores)
  return scores
}
const clearScores = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.includes('bewordled')) {
      localStorage.removeItem(key)
    }
  }
}

const highScores = ref(getScores())
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
</style>
