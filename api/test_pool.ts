import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Dynamic query string with .raw property
    const query = "SELECT 1 as success";
    const arr = [query] as any;
    arr.raw = [query];
    
    const result = await sql(arr);
    res.json({ result, isDynamicTemplate: true });
  } catch(e) {
    res.json({ error: e.message });
  }
}
