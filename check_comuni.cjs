const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./comuni_raw.json', 'utf8'));

// Format: { comune, cap, provincia }
data.map(c => {
  // c.cap is an array in this dataset usually. Let's take the first one or generic.
  // We'll see the exact schema of the first item to adjust.
  return c;
});

console.log("Total comuni:", data.length);
console.log("Sample 1:", data[0]);
console.log("Sample 2 (Milano?):", data.find(c => c.nome === 'Milano'));
