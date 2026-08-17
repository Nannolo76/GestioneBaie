import { Pool } from 'pg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  
  try {
    const dbPool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
    const client = await dbPool.connect();
    
    try {
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
      
      let chunk = [];
      if (req.body && Array.isArray(req.body)) {
        chunk = req.body;
      } else if (typeof req.body === 'string') {
        chunk = JSON.parse(req.body);
      }
      
      if (!chunk || chunk.length === 0) {
        return res.status(200).json({ status: 'no data' });
      }
      
      // Costruiamo una query VALUES multi-riga
      const values = [];
      for (const c of chunk) {
        const reg = c.regione.replace(/'/g, "''");
        const prov = c.provincia.replace(/'/g, "''");
        const sigla = c.provincia_sigla.replace(/'/g, "''");
        const com = c.comune.replace(/'/g, "''");
        const cap = c.cap.replace(/'/g, "''");
        const istat = c.istat_code.replace(/'/g, "''");
        values.push( + "" + ('', '', '', '', '', '') + "" + );
      }
      
      const queryStr =  + "" + 
        INSERT INTO anagrafica_territoriale (regione, provincia, provincia_sigla, comune, cap, istat_code)
        VALUES 
        ON CONFLICT (istat_code) DO NOTHING
       + "" + ;
      
      await client.query(queryStr);
      
      return res.status(200).json({ status: 'success', inserted: chunk.length });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
