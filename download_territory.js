import fs from 'fs';

async function run() {
  console.log('Downloading dataset...');
  const fetchRes = await fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json');
  const data = await fetchRes.json();
  
  const mapped = data.map(c => ({
    regione: c.regione.nome,
    provincia: c.provincia.nome,
    provincia_sigla: c.sigla,
    comune: c.nome,
    cap: c.cap[0],
    istat_code: c.codice
  }));
  
  fs.writeFileSync('src/data/territory.json', JSON.stringify(mapped));
  console.log('Saved src/data/territory.json with ' + mapped.length + ' records');
}
run();
