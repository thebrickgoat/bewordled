<script setup>
import GameContainer from './components/GameContainer.vue'
import HighScores from './components/HighScores.vue'
</script>

<template>
  <header>
    <div>
      <h1>bewordled</h1>
      <p>wordle and bejeweled put together. whats not to love?</p>
    </div>
  </header>
  <main>
    <div>
      <GameContainer />
    </div>
    <div>
      <HighScores />
    </div>
  </main>
  <footer>
    <div>
      <p>Created by <a href="https://thebrickgoat.com">thebrickgoat.com</a></p>
    </div>
  </footer>
</template>

<style scoped>
h1 {
  margin: 0;
  font-size: 3rem;
  text-transform: uppercase;
  font-weight: 900;
  color: var(--color-accent);
}

h2 {
}
</style>
