import { Pool } from 'pg';

export default async function handler(req, res) {
  try {
    const dbPool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
    const client = await dbPool.connect();
    
    const result = await client.query("SELECT count(*) as count FROM anagrafica_comuni");
    client.release();
    
    res.json({ count: result.rows[0].count });
  } catch(e) {
    res.json({ error: e.message, stack: e.stack });
  }
}
