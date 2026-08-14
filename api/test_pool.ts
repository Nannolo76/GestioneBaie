import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const { rows } = await pool.query('SELECT 1 as success');
    res.json({ rows, isPool: true });
  } catch(e) {
    res.json({ error: e.message });
  }
}
