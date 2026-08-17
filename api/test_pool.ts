import { Pool } from 'pg';

export default async function handler(req, res) {
  try {
    const dbPool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
    const client = await dbPool.connect();
    
    // Create a 150KB string
    const bigStr = "A".repeat(150000);
    const result = await client.query("SELECT \::text as success", [bigStr]);
    client.release();
    
    res.json({ result: "success", length: result.rows[0].success.length, driver: "native pg" });
  } catch(e) {
    res.json({ error: e.message, stack: e.stack });
  }
}
