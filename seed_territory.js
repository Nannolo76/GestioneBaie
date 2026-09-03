import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Manual env load
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const firstEqual = trimmed.indexOf('=');
      if (firstEqual !== -1) {
        const key = trimmed.substring(0, firstEqual).trim();
        let val = trimmed.substring(firstEqual + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  });
}

const pool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Creating table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS anagrafica_territoriale (
        id SERIAL PRIMARY KEY,
        regione TEXT NOT NULL,
        provincia TEXT NOT NULL,
        provincia_sigla TEXT NOT NULL,
        comune TEXT NOT NULL,
        cap TEXT NOT NULL,
        istat_code TEXT UNIQUE NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_territoriale_comune ON anagrafica_territoriale(comune);
    `);
    
    console.log('Downloading dataset...');
    const response = await fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json');
    const data = await response.json();
    
    console.log('Inserting ' + data.length + ' records...');
    
    const chunkSize = 2000;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const values = chunk.map(c => {
        const reg = c.regione.nome.replace(/'/g, "''");
        const prov = c.provincia.nome.replace(/'/g, "''");
        const sigla = c.sigla.replace(/'/g, "''");
        const com = c.nome.replace(/'/g, "''");
        const cap = c.cap[0].replace(/'/g, "''");
        const istat = c.codice.replace(/'/g, "''");
        return `('${reg}', '${prov}', '${sigla}', '${com}', '${cap}', '${istat}')`;
      });
      
      const queryStr = `
        INSERT INTO anagrafica_territoriale (regione, provincia, provincia_sigla, comune, cap, istat_code)
        VALUES ${values.join(',')}
        ON CONFLICT (istat_code) DO NOTHING
      `;
      
      await client.query(queryStr);
      console.log('Inserted up to ' + (i + chunk.length));
    }
    
    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
