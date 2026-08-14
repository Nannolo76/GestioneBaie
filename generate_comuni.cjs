const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./comuni_raw.json', 'utf8'));

const formatted = data.map(c => ({
  comune: c.nome,
  cap: c.cap[0] || '',
  provincia: c.sigla
}));

fs.mkdirSync('./src/data', { recursive: true });

const fileContent = `export const comuniData = ${JSON.stringify(formatted, null, 2)};\n`;
fs.writeFileSync('./src/data/comuni.ts', fileContent);

console.log("Written to src/data/comuni.ts");
