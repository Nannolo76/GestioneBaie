import { Pool } from 'pg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  
  try {
    const dbPool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
    const client = await dbPool.connect();
    
    try {
      console.log('Creating table...');
      await client.query( + "" + 
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
       + "" + );
      
      const checkCount = await client.query('SELECT count(*) as count FROM anagrafica_territoriale');
      const count = parseInt(checkCount.rows[0].count);
      if (count >= 7900) {
        return res.status(200).json({ status: 'already seeded fully', count });
      }
      
      console.log('Downloading dataset...');
      const fetchRes = await fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json');
      const data = await fetchRes.json();
      
      const chunkSize = 2000;
      const startIndex = count;
      const chunk = data.slice(startIndex, startIndex + chunkSize);
      
      if (chunk.length === 0) {
        return res.status(200).json({ status: 'no more data to seed', count });
      }
      
      const mapped = chunk.map(c => ({
        regione: c.regione.nome,
        provincia: c.provincia.nome,
        provincia_sigla: c.sigla,
        comune: c.nome,
        cap: c.cap[0],
        istat_code: c.codice
      }));
      
      const jsonStr = JSON.stringify(mapped).replace(/'/g, "''");
      const queryStr =  + "" + 
        INSERT INTO anagrafica_territoriale (regione, provincia, provincia_sigla, comune, cap, istat_code)
        SELECT regione, provincia, provincia_sigla, comune, cap, istat_code 
        FROM json_to_recordset(''::json)
        AS x(regione text, provincia text, provincia_sigla text, comune text, cap text, istat_code text)
        ON CONFLICT (istat_code) DO NOTHING
       + "" + ;
      
      await client.query(queryStr);
      
      return res.status(200).json({ 
        status: 'partial success - refresh page to continue', 
        seeded_in_this_batch: chunk.length,
        total_now: count + chunk.length
      });
      
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
