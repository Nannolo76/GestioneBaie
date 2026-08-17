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
      
      const mapped = chunk.map(c => ({
        regione: c.regione,
        provincia: c.provincia,
        provincia_sigla: c.provincia_sigla,
        comune: c.comune,
        cap: c.cap,
        istat_code: c.istat_code
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
      
      return res.status(200).json({ status: 'success', inserted: chunk.length });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
