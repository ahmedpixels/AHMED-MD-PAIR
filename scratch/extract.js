const fs = require('fs');
const code = fs.readFileSync('c:/Users/f/OneDrive/Desktop/AHMED-MD/KHAN-MD/AHMED-MD-BOT/index.js', 'utf8');

// The code starts with: let jffR;!function(){...}
// I will just execute it up to the point where it returns the deobfuscated string.
// Actually, it assigns the functions to an array or object, and then does something.
// The array of strings is at the bottom: `(function o5ki(Xks){...})("%5B%0C...`
const match = code.match(/\(function o5ki.*?\}\)\(\"(.*?)\"\)/);
if (match) {
  const payload = decodeURI(match[1]);
  fs.writeFileSync('c:/Users/f/OneDrive/Desktop/PAIR/ahmed-md-session-generator/scratch/payload.txt', payload);
  console.log('Payload saved');
} else {
  console.log('No match');
}
