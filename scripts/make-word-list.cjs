const fs = require('fs')
const path = require('path')

console.log(__dirname)
const filePath = path.join(__dirname, 'words.txt')
const wordArray = fs.readFileSync(filePath, 'utf8').split('\n')
console.log(wordArray)
const filteredWords = wordArray.filter((word) => word.length >= 3 && word.length <= 5)

console.log('Creating word list...')

fs.writeFile(
  'src/assets/words.js',
  `export const wordlist = ${JSON.stringify(filteredWords)}`,
  (err) => {
    if (err) {
      console.error('Error writing file:', err)
    } else {
      console.log('File successfully written!')
    }
  }
)
