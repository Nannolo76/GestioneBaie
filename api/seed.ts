export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    const { comuniData } = require('../src/data/comuni');
    
    const checkComuni = await sql('SELECT count(*) as count FROM anagrafica_comuni');
    const count = parseInt(checkComuni[0].count);
    
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
      await sql( + "INSERT INTO anagrafica_comuni (comune, cap, provincia) VALUES  ON CONFLICT DO NOTHING + ", params);
      seeded += chunk.length;
    }
    
    return res.status(200).json({ status: 'success', seeded });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
