import { neon } from '@neondatabase/serverless';
import { comuniData } from '../src/data/comuni.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // @ts-ignore
    const checkComuni = await sql.query('SELECT count(*) as count FROM anagrafica_comuni');
    const count = parseInt(checkComuni.rows ? checkComuni.rows[0].count : (checkComuni[0] ? checkComuni[0].count : 0));
    
    if (count >= 5000) {
      return res.status(200).json({ status: 'already seeded', count });
    }
    
    const chunkSize = 1000;
    let seeded = 0;
    for (let i = 0; i < comuniData.length; i += chunkSize) {
      const chunk = comuniData.slice(i, i + chunkSize);
      const values = [];
      const params = [];
      let paramIdx = 1;
      for (const c of chunk) {
        values.push( + "($${paramIdx++}, $${paramIdx++}, $${paramIdx++}) + ");
        params.push(c.comune, c.cap, c.provincia);
      }
      // @ts-ignore
      await sql.query( + "INSERT INTO anagrafica_comuni (comune, cap, provincia) VALUES  ON CONFLICT DO NOTHING + ", params);
      seeded += chunk.length;
    }
    
    return res.status(200).json({ status: 'success', seeded });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack, hasComuniData: !!comuniData, comuniDataLen: comuniData ? comuniData.length : 0 });
  }
}
