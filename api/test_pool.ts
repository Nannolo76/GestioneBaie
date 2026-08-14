import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const query = "SELECT 1 as success";
    const result = await sql([query]);
    res.json({ result, isDynamicTemplate: true });
  } catch(e) {
    res.json({ error: e.message });
  }
}
