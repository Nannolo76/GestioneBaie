import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const pool = createPool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    const result = await client.query("SELECT 1 as success");
    client.release();
    
    res.json({ result: result.rows, isCreatePool: true });
  } catch(e) {
    res.json({ error: e.message });
  }
}
