import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Test if sql.query exists and works
    const result = await sql.query("SELECT 1 as success");
    res.json({ result, isQueryFn: true });
  } catch(e) {
    res.json({ error: e.message });
  }
}
