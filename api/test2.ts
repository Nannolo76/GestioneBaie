import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const dbPath = path.resolve(process.cwd(), 'local_db.json');
  let dbExists = fs.existsSync(dbPath);
  let dbContent = null;
  let comuniLen = 0;
  if (dbExists) {
    dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    comuniLen = dbContent.anagrafica_comuni ? dbContent.anagrafica_comuni.length : 0;
  }
  
  res.status(200).json({
    dbExists,
    comuniLen,
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : null,
    isLocalFallback: !process.env.DATABASE_URL || process.env.DATABASE_URL === '[SENSITIVE]' || !process.env.DATABASE_URL.startsWith('postgres')
  });
}
