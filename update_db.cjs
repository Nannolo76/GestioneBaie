const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
  try {
    console.log("Adding missing columns to bookings...");
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id TEXT;`;
    console.log("Added client_id");
    
    // Check if other columns are missing
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS order_number TEXT;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS order_number_2 TEXT;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_usage_id TEXT;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pallet_returns JSONB;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pallet_voucher_number TEXT;`;
    console.log("Success");
  } catch (err) {
    console.error("Error", err);
  }
}
main();
