import { db } from '@vercel/postgres';
import { comuniData } from '../src/data/comuni.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  
  try {
    const client = await db.connect();
    try {
      const checkComuni = await client.query('SELECT count(*) as count FROM anagrafica_comuni');
      const count = parseInt(checkComuni.rows[0].count);
      
      if (count >= 5000) {
        return res.status(200).json({ status: 'already seeded', count });
      }
      
      const chunkSize = 2000;
      let seeded = 0;
      for (let i = 0; i < comuniData.length; i += chunkSize) {
        const chunk = comuniData.slice(i, i + chunkSize);
        const jsonStr = JSON.stringify(chunk);
        
        await client.query( + "" + 
          INSERT INTO anagrafica_comuni (comune, cap, provincia)
          SELECT comune, cap, provincia FROM json_to_recordset(::json)
          AS x(comune text, cap text, provincia text)
          ON CONFLICT DO NOTHING
         + "" + , [jsonStr]);
        seeded += chunk.length;
      }
      
      return res.status(200).json({ status: 'success', seeded });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
