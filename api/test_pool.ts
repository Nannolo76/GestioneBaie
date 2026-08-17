import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Create a 50KB string
    const bigStr = "A".repeat(50000);
    const result = await sqlSELECT  as success;
    res.json({ result: "success", length: result[0].success.length });
  } catch(e) {
    res.json({ error: e.message });
  }
}
