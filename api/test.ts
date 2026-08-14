import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  res.status(200).json({ keys: Object.keys(sql), hasQuery: typeof sql.query === 'function' });
}
