import { Pool } from 'pg';
import { comuniData } from '../src/data/comuni.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  
  try {
    const dbPool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
    const client = await dbPool.connect();
    try {
      const checkComuni = await client.query('SELECT count(*) as count FROM anagrafica_comuni');
      const count = parseInt(checkComuni.rows[0].count);
      
      if (count >= 7900) {
        return res.status(200).json({ status: 'already seeded fully', count });
      }
      
      // We process exactly ONE chunk of 2000 items starting from the current count.
      // This prevents Vercel's 10-second Serverless timeout!
      const chunkSize = 2000;
      const startIndex = count;
      const chunk = comuniData.slice(startIndex, startIndex + chunkSize);
      
      if (chunk.length === 0) {
        return res.status(200).json({ status: 'no more data to seed', count });
      }
      
      const jsonStr = JSON.stringify(chunk);
      const safeJsonStr = jsonStr.replace(/'/g, "''");
      const queryStr = `
        INSERT INTO anagrafica_comuni (comune, cap, provincia)
        SELECT comune, cap, provincia FROM json_to_recordset('${safeJsonStr}'::json)
        AS x(comune text, cap text, provincia text)
        ON CONFLICT DO NOTHING
      `;
      await client.query(queryStr);
      
      const newCount = count + chunk.length;
      return res.status(200).json({ 
        status: 'partial success - refresh page to continue', 
        seeded_in_this_batch: chunk.length,
        total_now: newCount,
        message: 'Aggiorna la pagina per caricare i prossimi 2000 comuni!'
      });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
