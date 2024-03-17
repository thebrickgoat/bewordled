const fs = require('fs')
const wordListPath = require('word-list')
const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n')
const filteredWords = wordArray.filter((word) => word.length == 5)

console.log('Creating word list...')

fs.writeFile(
  'src/assets/five-letter-words.js',
  `export const wordlist = ${JSON.stringify(filteredWords)}`,
  (err) => {
    if (err) {
      console.error('Error writing file:', err)
    } else {
      console.log('File successfully written!')
    }
  }
)
