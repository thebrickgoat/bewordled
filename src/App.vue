<script setup>
import GameContainer from './components/GameContainer.vue'
import HighScores from './components/HighScores.vue'
</script>

<template>
  <header>
    <div>
      <h1>bewordled</h1>
      <h2>wordle and bejeweled put together. whats not to love?</h2>
      <p>
        instructions: click a letter and then click another letter in the square up, down, left or
        right of it to swap letters and make words 3 to 5 letters long to earn points. Longer words
        are worth more points. When you get a word, any letters in that word that are in the secret
        word will fill in, and if you complete the secret word you will gain points equal to a 5
        letter word times the multiplier. The multipler will decrese with every match until the
        secret word is found, and increse by 10 for every secret word found.
      </p>
    </div>
  </header>
  <main>
    <div class="half">
      <GameContainer />
    </div>
    <div class="half">
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
