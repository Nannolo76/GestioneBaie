import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Manual loading of .env.local for local Windows environments where Vercel CLI fails to inject env variables
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.substring(0, firstEqual).trim();
            let val = trimmed.substring(firstEqual + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            process.env[key] = val;
          }
        }
      });
    }
  } catch (e) {
    console.error('Failed to manually load .env.local file:', e);
  }
}

const DB_FILE = path.resolve(process.cwd(), 'local_db.json');

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return {
      depots: [],
      warehouse_modules: [],
      bay_usages: [],
      bays: [],
      carriers: [],
      bookings: [],
      anomalies: [],
      activity_logs: [],
      activity_types: [],
      report_schedules: [],
      clients: [],
      pallet_types: [],
      users: [],
      shipments: []
    };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function mockSql(query: string, params: any[] = []): Promise<any[]> {
  const db = readDb();
  const q = query.trim().replace(/\s+/g, ' ');

  // 1. CREATE TABLE
  if (q.toUpperCase().startsWith('CREATE TABLE')) {
    return [];
  }

  // 2. SELECT count(*) as count FROM <table>
  const countMatch = q.match(/SELECT\s+count\(\*\)\s+as\s+count\s+FROM\s+(\w+)/i);
  if (countMatch) {
    const table = countMatch[1].toLowerCase();
    const list = db[table] || [];
    return [{ count: list.length.toString() }];
  }

  // 3. SELECT * FROM <table>
  const selectAllMatch = q.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
  if (selectAllMatch) {
    const table = selectAllMatch[1].toLowerCase();
    return db[table] || [];
  }

  // 4. INSERT INTO <table> (cols...) VALUES (vals...)
  const insertMatch = q.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
  if (insertMatch) {
    const table = insertMatch[1].toLowerCase();
    const cols = insertMatch[2].split(',').map(s => s.trim().toLowerCase());
    const row: any = {};
    cols.forEach((col, idx) => {
      let val = params[idx];
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      row[col] = val;
    });
    if (!db[table]) db[table] = [];
    db[table] = db[table].filter((r: any) => r.id !== row.id);
    db[table].push(row);
    writeDb(db);
    return [];
  }

  // 5. UPDATE <table> SET col1=$1... WHERE colKey=$N
  if (q.toUpperCase().startsWith('UPDATE')) {
    const updateMatch = q.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
    if (updateMatch) {
      const table = updateMatch[1].toLowerCase();
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];

      const whereParts = whereClause.split('=');
      if (whereParts.length === 2) {
        const whereKey = whereParts[0].trim().toLowerCase();
        const paramIdxMatch = whereParts[1].match(/\$(\d+)/);
        if (paramIdxMatch) {
          const whereVal = params[parseInt(paramIdxMatch[1]) - 1];
          const list = db[table] || [];
          
          list.forEach((row: any) => {
            if (row[whereKey] === whereVal) {
              const assignments = setClause.split(',');
              assignments.forEach(assign => {
                const parts = assign.split('=');
                if (parts.length === 2) {
                  const col = parts[0].trim().toLowerCase();
                  const valMatch = parts[1].trim().match(/\$(\d+)/);
                  if (valMatch) {
                    let val = params[parseInt(valMatch[1]) - 1];
                    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                      try { val = JSON.parse(val); } catch (e) {}
                    }
                    row[col] = val;
                  } else {
                    let rawVal: any = parts[1].trim();
                    if (rawVal === 'TRUE') rawVal = true;
                    else if (rawVal === 'FALSE') rawVal = false;
                    else if (rawVal.startsWith("'") && rawVal.endsWith("'")) {
                      rawVal = rawVal.substring(1, rawVal.length - 1);
                    }
                    row[col] = rawVal;
                  }
                }
              });
            }
          });
          db[table] = list;
          writeDb(db);
        }
      }
    }
    return [];
  }

  // 6. DELETE FROM <table> WHERE id = $1
  if (q.toUpperCase().startsWith('DELETE')) {
    const deleteMatch = q.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+id\s*=\s*\$(\d+)/i);
    if (deleteMatch) {
      const table = deleteMatch[1].toLowerCase();
      const paramIdx = parseInt(deleteMatch[2]) - 1;
      const idVal = params[paramIdx];
      if (db[table]) {
        db[table] = db[table].filter((r: any) => r.id !== idVal);
        writeDb(db);
      }
    }
    return [];
  }

  return [];
}

const isLocalFallback = !process.env.DATABASE_URL || 
                        process.env.DATABASE_URL === '[SENSITIVE]' || 
                        !process.env.DATABASE_URL.startsWith('postgres');

const sql = isLocalFallback ? mockSql : neon(process.env.DATABASE_URL!);

// Funzione helper per verificare ed inizializzare il DB
async function initializeDb() {
  // 1. Creazione Tabelle
  await sql(`
    CREATE TABLE IF NOT EXISTS depots (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS warehouse_modules (
      id TEXT PRIMARY KEY,
      depot_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS bay_usages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS bays (
      id TEXT PRIMARY KEY,
      depot_id TEXT NOT NULL,
      module_id TEXT,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      current_booking_id TEXT,
      bay_usage_id TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS carriers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL,
      license_plate TEXT,
      license_plate_trailer TEXT,
      phone TEXT,
      vat_number TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      carrier_id TEXT NOT NULL,
      depot_id TEXT NOT NULL,
      date TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      status TEXT NOT NULL,
      bay_id TEXT,
      license_plate TEXT NOT NULL,
      license_plate_trailer TEXT,
      driver_name TEXT NOT NULL,
      driver_phone TEXT,
      notes TEXT,
      notes_history JSONB,
      checklist JSONB,
      pallet_places INTEGER,
      ticket_number TEXT,
      is_edited_in_bay BOOLEAN DEFAULT FALSE,
      bay_change_reason TEXT,
      time_in_gate TEXT,
      time_in_bay TEXT,
      time_out_bay TEXT,
      time_out_gate TEXT,
      driver_license TEXT,
      driver_license_release TEXT,
      driver_license_expiry TEXT,
      order_number TEXT,
      order_number_2 TEXT,
      client_usage_id TEXT,
      pallet_returns JSONB,
      pallet_voucher_number TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS anomalies (
      id TEXT PRIMARY KEY,
      depot_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      resolved BOOLEAN DEFAULT FALSE,
      resolution_notes TEXT,
      resolved_by TEXT,
      resolved_at TEXT,
      booking_id TEXT,
      ticket_number TEXT,
      license_plate TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      depot_id TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS activity_types (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      base_duration_minutes DOUBLE PRECISION,
      minutes_per_pallet DOUBLE PRECISION
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS report_schedules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      frequency TEXT NOT NULL,
      recipients TEXT NOT NULL,
      report_type TEXT NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      depot_id TEXT NOT NULL
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      vat_number TEXT,
      email TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS pallet_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      depot_id TEXT NOT NULL
    )
  `);

  await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`);
  await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS depot_ids JSONB`);
  await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT`);
  await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT`);

  await sql(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      carrier_id TEXT NOT NULL,
      depot_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      order_number_2 TEXT,
      activity_type TEXT NOT NULL,
      pallet_places INTEGER NOT NULL,
      status TEXT NOT NULL,
      expected_date TEXT,
      expected_time TEXT,
      origin_or_destination TEXT,
      goods_type TEXT,
      license_plate TEXT,
      expected_delivery_date TEXT,
      booking_id TEXT,
      subject_name TEXT,
      address TEXT,
      city TEXT,
      cap TEXT,
      province TEXT,
      region TEXT,
      country TEXT,
      gross_weight DOUBLE PRECISION,
      delivery_notes TEXT,
      internal_notes TEXT
    )
  `);

  // Migrazione per campi TMS estesi
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS order_number_2 TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expected_date TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expected_time TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_or_destination TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS goods_type TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS license_plate TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS expected_delivery_date TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS booking_id TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS subject_name TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS address TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS city TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS cap TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS province TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS region TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS country TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS gross_weight DOUBLE PRECISION`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS delivery_notes TEXT`);
  await sql(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS internal_notes TEXT`);

  // Se non ci sono plant inseriti, eseguiamo il seed iniziale
  const checkDepots = await sql('SELECT count(*) as count FROM depots');
  if (parseInt(checkDepots[0].count) === 0) {
    // SEED DEPOTS
    const defaultDepots = [
      { id: 'depot-milano', name: 'Milano Logistics Plant', city: 'Milano (MI)' },
      { id: 'depot-roma', name: 'Roma Logistics Plant', city: 'Roma (RM)' },
      { id: 'depot-bari', name: 'Bari Logistics Plant', city: 'Bari (BA)' },
    ];
    for (const d of defaultDepots) {
      await sql('INSERT INTO depots (id, name, city) VALUES ($1, $2, $3)', [d.id, d.name, d.city]);
    }

    // SEED WAREHOUSE MODULES
    const defaultWarehouseModules = [
      { id: 'module-m-1', depotId: 'depot-milano', name: 'Modulo A (Secco)' },
      { id: 'module-m-2', depotId: 'depot-milano', name: 'Modulo B (Fresco)' },
      { id: 'module-r-1', depotId: 'depot-roma', name: 'Modulo Unico' },
      { id: 'module-b-1', depotId: 'depot-bari', name: 'Modulo Est' },
    ];
    for (const m of defaultWarehouseModules) {
      await sql('INSERT INTO warehouse_modules (id, depot_id, name) VALUES ($1, $2, $3)', [m.id, m.depotId, m.name]);
    }

    // SEED BAY USAGES
    const defaultBayUsages = [
      { id: 'bu-1', name: 'Crossdocking', description: 'Transiti rapidi e smistamento' },
      { id: 'bu-2', name: 'Acqua / Bevande', description: 'Attracco preferenziale carichi pesanti di liquidi' },
      { id: 'bu-3', name: 'Pallet vuoti', description: 'Stoccaggio e scarico rulliere pallet vuoti' },
      { id: 'bu-4', name: 'Cliente Rossi', description: 'Rampa riservata spedizioni Cliente Rossi SpA' },
    ];
    for (const u of defaultBayUsages) {
      await sql('INSERT INTO bay_usages (id, name, description) VALUES ($1, $2, $3)', [u.id, u.name, u.description]);
    }

    // SEED BAYS
    const defaultBays = [
      { id: 'bay-m-01', depotId: 'depot-milano', moduleId: 'module-m-1', name: 'Baia M-01 (Dry)', status: 'DISPONIBILE', bayUsageId: 'bu-1' },
      { id: 'bay-m-02', depotId: 'depot-milano', moduleId: 'module-m-1', name: 'Baia M-02 (Dry)', status: 'DISPONIBILE', bayUsageId: 'bu-4' },
      { id: 'bay-m-03', depotId: 'depot-milano', moduleId: 'module-m-2', name: 'Baia M-03 (Cold)', status: 'DISPONIBILE', bayUsageId: 'bu-2' },
      { id: 'bay-m-04', depotId: 'depot-milano', moduleId: 'module-m-2', name: 'Baia M-04 (Cold)', status: 'DISPONIBILE', bayUsageId: 'bu-3' },
      { id: 'bay-r-01', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-01', status: 'OCCUPATA', currentBookingId: 'book-roma-active', bayUsageId: null },
      { id: 'bay-r-02', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-02', status: 'DISPONIBILE', bayUsageId: null },
      { id: 'bay-r-03', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-03', status: 'DISPONIBILE', bayUsageId: null },
      { id: 'bay-r-04', depotId: 'depot-roma', moduleId: 'module-r-1', name: 'Baia R-04', status: 'MANUTENZIONE', bayUsageId: null },
      { id: 'bay-b-01', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-01', status: 'DISPONIBILE', bayUsageId: null },
      { id: 'bay-b-02', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-02', status: 'DISPONIBILE', bayUsageId: null },
      { id: 'bay-b-03', depotId: 'depot-bari', moduleId: 'module-b-1', name: 'Baia B-03', status: 'DISPONIBILE', bayUsageId: null },
    ];
    for (const b of defaultBays) {
      await sql('INSERT INTO bays (id, depot_id, module_id, name, status, current_booking_id, bay_usage_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
        b.id, b.depotId, b.moduleId, b.name, b.status, b.currentBookingId || null, b.bayUsageId || null
      ]);
    }

    // SEED CARRIERS
    const defaultCarriers = [
      { id: 'carrier-1', name: 'Logistica Uno Europe', email: 'info@logisticauno.com', status: 'APPROVATO', licensePlate: 'AA123BB', vatNumber: 'IT12345678901' },
      { id: 'carrier-2', name: 'Freccia Rossa Trasporti', email: 'operations@frecciarossa.it', status: 'APPROVATO', licensePlate: 'CC456DD', vatNumber: 'IT98765432109' },
      { id: 'carrier-3', name: 'Adriatica Cargo Srl', email: 'logistic@adriaticacargo.it', status: 'ATTESA_APPROVAZIONE', licensePlate: 'EE789FF', vatNumber: 'IT11112222333' },
      { id: 'carrier-4', name: 'Euro Shipping Spedizioni', email: 'book@euroshipping.com', status: 'ATTESA_APPROVAZIONE', vatNumber: 'IT44445555666' },
    ];
    for (const c of defaultCarriers) {
      await sql('INSERT INTO carriers (id, name, email, status, license_plate, vat_number) VALUES ($1, $2, $3, $4, $5, $6)', [
        c.id, c.name, c.email, c.status, c.licensePlate || null, c.vatNumber || null
      ]);
    }

    // SEED ACTIVITY TYPES
    const defaultActivityTypes = [
      { id: 'act-1', name: 'Scarico Standard', code: 'SCARICO', baseDurationMinutes: 15.0, minutesPerPallet: 1.0 },
      { id: 'act-2', name: 'Carico Standard', code: 'CARICO', baseDurationMinutes: 20.0, minutesPerPallet: 1.5 },
      { id: 'act-3', name: 'Reso Fornitore', code: 'RESO', baseDurationMinutes: 10.0, minutesPerPallet: 1.0 },
    ];
    for (const a of defaultActivityTypes) {
      await sql('INSERT INTO activity_types (id, code, name, base_duration_minutes, minutes_per_pallet) VALUES ($1, $2, $3, $4, $5)', [
        a.id, a.code, a.name, a.baseDurationMinutes, a.minutesPerPallet
      ]);
    }

    // SEED REPORT SCHEDULES
    const defaultReportSchedules = [
      { id: 'rep-1', name: 'Saturazione Giornaliera Baie', frequency: 'GIORNALIERO', recipients: 'milano.ops@logisticauno.it', reportType: 'Saturazione Baie', active: true, depotId: 'depot-milano' },
      { id: 'rep-2', name: 'Performance Tempi Turnaround Vettori', frequency: 'SETTIMANALE', recipients: 'direzione.logistica@logisticauno.it', reportType: 'Tempi Turnaround', active: true, depotId: 'depot-milano' }
    ];
    for (const r of defaultReportSchedules) {
      await sql('INSERT INTO report_schedules (id, name, frequency, recipients, report_type, active, depot_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
        r.id, r.name, r.frequency, r.recipients, r.reportType, r.active, r.depotId
      ]);
    }

    // SEED CLIENTS
    const checkClients = await sql('SELECT count(*) as count FROM clients');
    if (parseInt(checkClients[0].count) === 0) {
      const defaultClients = [
        { id: 'client-rossi', name: 'Rossi SpA', vatNumber: 'IT01234567890', email: 'logistica@rossi.it' },
        { id: 'client-bianchi', name: 'Bianchi Srl', vatNumber: 'IT09876543210', email: 'ordini@bianchisrl.it' },
        { id: 'client-verdi', name: 'Verdi Corp', vatNumber: 'IT11223344556', email: 'supply@verdicorp.it' },
      ];
      for (const c of defaultClients) {
        await sql('INSERT INTO clients (id, name, vat_number, email) VALUES ($1, $2, $3, $4)', [c.id, c.name, c.vatNumber, c.email]);
      }
    }

    // SEED PALLET TYPES
    const checkPalletTypes = await sql('SELECT count(*) as count FROM pallet_types');
    if (parseInt(checkPalletTypes[0].count) === 0) {
      const defaultPallets = [
        { id: 'plt-epal', name: 'EPAL', description: 'Pallet standard europeo (80x120)' },
        { id: 'plt-chep', name: 'CHEP', description: 'Pallet blu a noleggio (80x120)' },
        { id: 'plt-duss', name: 'DUSSELDORF', description: 'Mezzo pallet (60x80)' },
        { id: 'plt-miniduss', name: 'MINI-DUSS', description: 'Mini pallet plastificato o legno' },
        { id: 'plt-altro', name: 'ALTRO', description: 'Altre tipologie di legni' },
      ];
      for (const p of defaultPallets) {
        await sql('INSERT INTO pallet_types (id, name, description) VALUES ($1, $2, $3)', [p.id, p.name, p.description]);
      }
    }

    // SEED USERS
    const checkUsers = await sql('SELECT count(*) as count FROM users');
    if (parseInt(checkUsers[0].count) === 0) {
      const defaultUsers = [
        { id: 'user-1', name: 'Alessandro Neri', username: 'admin', email: 'a.neri@logisticauno.it', role: 'ADMIN', depotIds: ['depot-milano', 'depot-roma', 'depot-bari'], password: 'Password123!', status: 'ACTIVE' },
        { id: 'user-2', name: 'Fabio Gialli', username: 'f.gialli', email: 'f.gialli@logisticauno.it', role: 'GUARDIA_CANCELLO', depotIds: ['depot-milano'], password: 'Password123!', status: 'ACTIVE' },
        { id: 'user-3', name: 'Roberto Verdi', username: 'r.verdi', email: 'r.verdi@logisticauno.it', role: 'OPERATORE_YARD', depotIds: ['depot-roma'], password: 'Password123!', status: 'ACTIVE' },
        { id: 'user-4', name: 'Sara Rossi', username: 's.rossi', email: 's.rossi@logisticauno.it', role: 'GUARDIA_CANCELLO', depotIds: ['depot-bari'], password: 'Password123!', status: 'ACTIVE' },
        { id: 'user-5', name: 'Filippo Marroni', username: 'f.marroni', email: 'f.marroni@logisticauno.it', role: 'PREPOSTO', depotIds: ['depot-milano'], password: 'Password123!', status: 'ACTIVE' },
      ];
      for (const u of defaultUsers) {
        await sql('INSERT INTO users (id, name, username, email, role, depot_id, depot_ids, password, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
          u.id, u.name, u.username, u.email, u.role, u.depotIds[0], JSON.stringify(u.depotIds), u.password, u.status
        ]);
      }
    }

    // SEED SHIPMENTS
    const checkShipments = await sql('SELECT count(*) as count FROM shipments');
    if (parseInt(checkShipments[0].count) === 0) {
      const todayDate = new Date().toISOString().split('T')[0];
      const defaultShipments = [
        { id: 'ship-1', clientId: 'client-rossi', carrierId: 'carrier-1', depotId: 'depot-milano', orderNumber: 'ORD-2026-9923', orderNumber2: 'REF-MIL-99', activityType: 'CARICO', palletPlaces: 24, status: 'PIANIFICATO', expectedDate: todayDate, expectedTime: '10:00', originOrDestination: 'Bari Logistics Hub', goodsType: 'Alimentare', expectedDeliveryDate: todayDate, bookingId: 'book-milano-1', licensePlate: 'AA123BB' },
        { id: 'ship-2', clientId: 'client-bianchi', carrierId: 'carrier-2', depotId: 'depot-milano', orderNumber: 'ORD-2026-8811', orderNumber2: 'REF-MIL-88', activityType: 'SCARICO', palletPlaces: 12, status: 'PIANIFICATO', expectedDate: todayDate, expectedTime: '14:30', originOrDestination: 'Milano Sud', goodsType: 'Elettronica', bookingId: 'book-milano-2', licensePlate: 'CC456DD' },
        { id: 'ship-3', clientId: 'client-verdi', carrierId: 'carrier-1', depotId: 'depot-milano', orderNumber: 'ORD-2026-1234', orderNumber2: '', activityType: 'CARICO', palletPlaces: 33, status: 'DA_PIANIFICARE', expectedDate: todayDate, expectedTime: '16:00', originOrDestination: 'Roma Logistics Hub', goodsType: 'Plastica', expectedDeliveryDate: todayDate },
      ];
      for (const s of defaultShipments) {
        await sql(`
          INSERT INTO shipments (
            id, client_id, carrier_id, depot_id, order_number, order_number_2, activity_type, pallet_places, status,
            expected_date, expected_time, origin_or_destination, goods_type, license_plate, expected_delivery_date, booking_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          s.id, s.clientId, s.carrierId, s.depotId, s.orderNumber, s.orderNumber2 || null, s.activityType, s.palletPlaces, s.status,
          s.expectedDate, s.expectedTime || null, s.originOrDestination, s.goodsType || null, s.licensePlate || null, s.expectedDeliveryDate || null, s.bookingId || null
        ]);
      }
    }

    // SEED BOOKINGS
    const today = new Date().toISOString().split('T')[0];
    const defaultBookings = [
      {
        id: 'book-milano-1',
        carrierId: 'carrier-1',
        depotId: 'depot-milano',
        date: today,
        activityType: 'CARICO',
        status: 'PRENOTATO',
        licensePlate: 'AA123BB',
        licensePlateTrailer: 'AA777XX',
        driverName: 'Marco Rossi',
        driverPhone: '+39 347 1234567',
        palletPlaces: 24,
        ticketNumber: 'MIL-C-392',
        notes: 'Carico urgente merci secche',
        orderNumber: 'ORD-2026-9923',
        orderNumber2: 'ORD-2026-9924',
        driverLicense: 'U19283748A',
        driverLicenseRelease: '2024-05-12',
        driverLicenseExpiry: '2028-05-12',
        clientUsageId: 'bu-4',
        notesHistory: JSON.stringify([
          { id: 'n-init-1', timestamp: new Date(Date.now() - 36000000).toISOString(), author: 'Vettore Logistica', text: 'Carico urgente merci secche' }
        ]),
        checklist: null,
        palletReturns: null,
        palletVoucherNumber: null
      },
      {
        id: 'book-milano-2',
        carrierId: 'carrier-2',
        depotId: 'depot-milano',
        date: today,
        activityType: 'SCARICO',
        status: 'AL_CANCELLO',
        licensePlate: 'CC456DD',
        licensePlateTrailer: null,
        driverName: 'Giuseppe Bianchi',
        driverPhone: '+39 333 9876543',
        palletPlaces: 12,
        ticketNumber: 'MIL-S-712',
        notes: 'Carico fresco',
        orderNumber: 'ORD-2026-8811',
        orderNumber2: null,
        driverLicense: 'Y99882233B',
        driverLicenseRelease: '2023-01-10',
        driverLicenseExpiry: '2027-01-10',
        clientUsageId: 'bu-1',
        notesHistory: null,
        checklist: null,
        palletReturns: null,
        palletVoucherNumber: null
      },
      {
        id: 'book-roma-active',
        carrierId: 'carrier-1',
        depotId: 'depot-roma',
        date: today,
        activityType: 'CARICO',
        status: 'IN_BAIA',
        licensePlate: 'AA123BB',
        licensePlateTrailer: null,
        driverName: 'Franco Neri',
        driverPhone: '+39 340 1111111',
        palletPlaces: 33,
        ticketNumber: 'ROM-C-992',
        notes: 'Attesa rampa',
        orderNumber: 'ORD-2026-0001',
        orderNumber2: null,
        driverLicense: 'D88776655A',
        driverLicenseRelease: '2025-02-15',
        driverLicenseExpiry: '2029-02-15',
        clientUsageId: 'bu-4',
        notesHistory: null,
        checklist: null,
        palletReturns: null,
        palletVoucherNumber: null
      }
    ];
    for (const b of defaultBookings) {
      await sql(`
        INSERT INTO bookings (
          id, carrier_id, depot_id, date, activity_type, status, bay_id, license_plate, license_plate_trailer,
          driver_name, driver_phone, notes, notes_history, checklist, pallet_places, ticket_number,
          driver_license, driver_license_release, driver_license_expiry, client_usage_id, client_id, pallet_returns, pallet_voucher_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      `, [
        b.id, b.carrierId, b.depotId, b.date, b.activityType, b.status, b.id === 'book-roma-active' ? 'bay-r-01' : null,
        b.licensePlate, b.licensePlateTrailer, b.driverName, b.driverPhone, b.notes, b.notesHistory, b.checklist,
        b.palletPlaces, b.ticketNumber, b.driverLicense, b.driverLicenseRelease, b.driverLicenseExpiry, b.clientUsageId,
        b.clientId || null, b.palletReturns, b.palletVoucherNumber
      ]);
    }
  }
}

export default async function handler(req: any, res: any) {
  // Permetti chiamate CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Inizializza o migra il DB se vuoto
    await initializeDb();

    if (req.method === 'GET') {
      // Carica tutti i dati in parallelo
      const [
        depots,
        warehouseModules,
        bayUsages,
        bays,
        carriers,
        bookings,
        anomalies,
        activityLogs,
        activityTypes,
        reportSchedules,
        clients,
        palletTypes,
        users,
        shipments
      ] = await Promise.all([
        sql('SELECT * FROM depots'),
        sql('SELECT * FROM warehouse_modules'),
        sql('SELECT * FROM bay_usages'),
        sql('SELECT * FROM bays ORDER BY name ASC'),
        sql('SELECT * FROM carriers'),
        sql('SELECT * FROM bookings ORDER BY date DESC, ticket_number ASC'),
        sql('SELECT * FROM anomalies ORDER BY timestamp DESC'),
        sql('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 200'),
        sql('SELECT * FROM activity_types'),
        sql('SELECT * FROM report_schedules'),
        sql('SELECT * FROM clients ORDER BY name ASC'),
        sql('SELECT * FROM pallet_types ORDER BY name ASC'),
        sql('SELECT * FROM users ORDER BY name ASC'),
        sql('SELECT * FROM shipments ORDER BY order_number ASC'),
      ]);

      // Mappiamo i campi snake_case in camelCase per mantenere la compatibilità col frontend e parse dei campi JSON
      const parsedBookings = bookings.map((b: any) => ({
        id: b.id,
        carrierId: b.carrier_id,
        depotId: b.depot_id,
        date: b.date,
        activityType: b.activity_type,
        status: b.status,
        bayId: b.bay_id,
        licensePlate: b.license_plate,
        licensePlateTrailer: b.license_plate_trailer,
        driverName: b.driver_name,
        driverPhone: b.driver_phone,
        notes: b.notes,
        notesHistory: b.notes_history,
        checklist: b.checklist,
        palletPlaces: b.pallet_places,
        ticketNumber: b.ticket_number,
        isEditedInBay: b.is_edited_in_bay,
        bayChangeReason: b.bay_change_reason,
        timeInGate: b.time_in_gate,
        timeInBay: b.time_in_bay,
        timeOutBay: b.time_out_bay,
        timeOutGate: b.time_out_gate,
        driverLicense: b.driver_license,
        driverLicenseRelease: b.driver_license_release,
        driverLicenseExpiry: b.driver_license_expiry,
        orderNumber: b.order_number,
        orderNumber2: b.order_number_2,
        clientUsageId: b.client_usage_id,
        palletReturns: b.pallet_returns,
        palletVoucherNumber: b.pallet_voucher_number
      }));

      const parsedModules = warehouseModules.map((m: any) => ({
        id: m.id,
        depotId: m.depot_id,
        name: m.name,
        description: m.description
      }));

      const parsedBays = bays.map((b: any) => ({
        id: b.id,
        depotId: b.depot_id,
        moduleId: b.module_id,
        name: b.name,
        status: b.status,
        currentBookingId: b.current_booking_id,
        bayUsageId: b.bay_usage_id
      }));

      const parsedCarriers = carriers.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        status: c.status,
        licensePlate: c.license_plate,
        licensePlateTrailer: c.license_plate_trailer,
        phone: c.phone,
        vatNumber: c.vat_number
      }));

      const parsedAnomalies = anomalies.map((a: any) => ({
        id: a.id,
        depotId: a.depot_id,
        type: a.type,
        message: a.message,
        timestamp: a.timestamp,
        resolved: a.resolved,
        resolutionNotes: a.resolution_notes,
        resolvedBy: a.resolved_by,
        resolvedAt: a.resolved_at,
        bookingId: a.booking_id,
        ticketNumber: a.ticket_number,
        licensePlate: a.license_plate
      }));

      const parsedLogs = activityLogs.map((l: any) => ({
        id: l.id,
        timestamp: l.timestamp,
        depotId: l.depot_id,
        message: l.message,
        type: l.type
      }));

      const parsedActivityTypes = activityTypes.map((a: any) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        baseDurationMinutes: a.base_duration_minutes,
        minutesPerPallet: a.minutes_per_pallet
      }));

      const parsedSchedules = reportSchedules.map((s: any) => ({
        id: s.id,
        name: s.name,
        frequency: s.frequency,
        recipients: s.recipients,
        reportType: s.report_type,
        active: s.active,
        depotId: s.depot_id
      }));

      const parsedUsers = users.map((u: any) => {
        let depotIds: string[] = [];
        if (u.depot_ids) {
          try {
            depotIds = typeof u.depot_ids === 'string' ? JSON.parse(u.depot_ids) : u.depot_ids;
          } catch (e) {
            depotIds = [u.depot_id];
          }
        } else {
          depotIds = u.depot_id ? [u.depot_id] : [];
        }
        return {
          id: u.id,
          name: u.name,
          username: u.username || '',
          email: u.email,
          role: u.role,
          depotId: u.depot_id || '',
          depotIds: depotIds,
          password: u.password || '',
          status: u.status || 'ACTIVE'
        };
      });

      const parsedShipments = shipments.map((s: any) => ({
        id: s.id,
        clientId: s.client_id,
        carrierId: s.carrier_id,
        depotId: s.depot_id,
        orderNumber: s.order_number,
        orderNumber2: s.order_number_2,
        activityType: s.activity_type,
        palletPlaces: s.pallet_places,
        status: s.status,
        expectedDate: s.expected_date,
        expectedTime: s.expected_time,
        originOrDestination: s.origin_or_destination,
        goodsType: s.goods_type,
        licensePlate: s.license_plate,
        expectedDeliveryDate: s.expected_delivery_date,
        bookingId: s.booking_id,
        subjectName: s.subject_name,
        address: s.address,
        city: s.city,
        cap: s.cap,
        province: s.province,
        region: s.region,
        country: s.country,
        grossWeight: s.gross_weight,
        deliveryNotes: s.delivery_notes,
        internalNotes: s.internal_notes
      }));

      return res.status(200).json({
        depots,
        warehouseModules: parsedModules,
        bayUsages,
        bays: parsedBays,
        carriers: parsedCarriers,
        bookings: parsedBookings,
        anomalies: parsedAnomalies,
        activityLogs: parsedLogs,
        activityTypes: parsedActivityTypes,
        reportSchedules: parsedSchedules,
        clients,
        palletTypes,
        users: parsedUsers,
        shipments: parsedShipments
      });
    }

    if (req.method === 'POST') {
      const { action, payload } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Manca l\'azione' });
      }

      switch (action) {
        case 'ADD_DEPOT':
          await sql('INSERT INTO depots (id, name, city) VALUES ($1, $2, $3)', [payload.id, payload.name, payload.city]);
          break;
        case 'UPDATE_DEPOT':
          await sql('UPDATE depots SET name = $1, city = $2 WHERE id = $3', [payload.name, payload.city, payload.id]);
          break;
        case 'DELETE_DEPOT':
          await sql('DELETE FROM depots WHERE id = $1', [payload.id]);
          break;

        case 'ADD_WAREHOUSE_MODULE':
          await sql('INSERT INTO warehouse_modules (id, depot_id, name, description) VALUES ($1, $2, $3, $4)', [payload.id, payload.depotId, payload.name, payload.description || null]);
          break;
        case 'UPDATE_WAREHOUSE_MODULE':
          await sql('UPDATE warehouse_modules SET name = $1, description = $2, depot_id = $3 WHERE id = $4', [payload.name, payload.description || null, payload.depotId, payload.id]);
          break;
        case 'DELETE_WAREHOUSE_MODULE':
          await sql('DELETE FROM warehouse_modules WHERE id = $1', [payload.id]);
          break;

        case 'ADD_BAY':
          await sql('INSERT INTO bays (id, depot_id, module_id, name, status, bay_usage_id) VALUES ($1, $2, $3, $4, $5, $6)', [
            payload.id, payload.depotId, payload.moduleId || null, payload.name, payload.status, payload.bayUsageId || null
          ]);
          break;
        case 'UPDATE_BAY':
          await sql('UPDATE bays SET name = $1, module_id = $2, bay_usage_id = $3 WHERE id = $4', [payload.name, payload.moduleId || null, payload.bayUsageId || null, payload.id]);
          break;
        case 'DELETE_BAY':
          await sql('DELETE FROM bays WHERE id = $1', [payload.id]);
          break;

        case 'UPDATE_BAY_STATUS':
          await sql('UPDATE bays SET status = $1, current_booking_id = $2 WHERE id = $3', [payload.status, payload.currentBookingId || null, payload.id]);
          break;

        case 'UPDATE_BAY_USAGE':
          await sql('UPDATE bays SET bay_usage_id = $1 WHERE id = $2', [payload.usageId || null, payload.id]);
          break;

        case 'ADD_BAY_USAGE':
          await sql('INSERT INTO bay_usages (id, name, description) VALUES ($1, $2, $3)', [payload.id, payload.name, payload.description || null]);
          break;

        case 'DELETE_BAY_USAGE':
          await sql('DELETE FROM bay_usages WHERE id = $1', [payload.id]);
          // Scollega dalle baie associate
          await sql('UPDATE bays SET bay_usage_id = NULL WHERE bay_usage_id = $1', [payload.id]);
          break;

        case 'ADD_CARRIER':
          await sql('INSERT INTO carriers (id, name, email, status, license_plate, license_plate_trailer, phone, vat_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
            payload.id, payload.name, payload.email, payload.status, payload.licensePlate || null, payload.licensePlateTrailer || null, payload.phone || null, payload.vatNumber || null
          ]);
          break;

        case 'APPROVE_CARRIER':
          await sql("UPDATE carriers SET status = 'APPROVATO' WHERE id = $1", [payload.id]);
          break;

        case 'REJECT_CARRIER':
          await sql("UPDATE carriers SET status = 'RIFIUTATO' WHERE id = $1", [payload.id]);
          break;

        case 'UPDATE_CARRIER_PROFILE':
          await sql('UPDATE carriers SET name = $1, email = $2, license_plate = $3, license_plate_trailer = $4, phone = $5, vat_number = $6 WHERE id = $7', [
            payload.name, payload.email, payload.licensePlate || null, payload.licensePlateTrailer || null, payload.phone || null, payload.vatNumber || null, payload.id
          ]);
          break;
        case 'UPDATE_CARRIER':
          await sql('UPDATE carriers SET name = $1, email = $2, vat_number = $3, license_plate = $4 WHERE id = $5', [
            payload.name, payload.email, payload.vatNumber || null, payload.licensePlate || null, payload.id
          ]);
          break;
        case 'DELETE_CARRIER':
          await sql('DELETE FROM carriers WHERE id = $1', [payload.id]);
          break;

        case 'ADD_BOOKING':
          await sql(`
            INSERT INTO bookings (
              id, carrier_id, depot_id, date, activity_type, status, bay_id, license_plate, license_plate_trailer,
              driver_name, driver_phone, notes, notes_history, checklist, pallet_places, ticket_number,
              driver_license, driver_license_release, driver_license_expiry, client_usage_id, client_id, pallet_returns, pallet_voucher_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
          `, [
            payload.id, payload.carrierId, payload.depotId, payload.date, payload.activityType, payload.status, payload.bayId || null,
            payload.licensePlate, payload.licensePlateTrailer || null, payload.driverName, payload.driverPhone || null,
            payload.notes || null, payload.notesHistory ? JSON.stringify(payload.notesHistory) : null,
            payload.checklist ? JSON.stringify(payload.checklist) : null, payload.palletPlaces || null, payload.ticketNumber || null,
            payload.driverLicense || null, payload.driverLicenseRelease || null, payload.driverLicenseExpiry || null, payload.clientUsageId || null,
            payload.clientId || null,
            payload.palletReturns ? JSON.stringify(payload.palletReturns) : null, payload.palletVoucherNumber || null
          ]);
          break;

        case 'UPDATE_BOOKING_STATUS':
          await sql(`
            UPDATE bookings SET 
              status = $1, 
              bay_id = $2, 
              time_in_gate = $3, 
              time_in_bay = $4, 
              time_out_bay = $5, 
              time_out_gate = $6
            WHERE id = $7
          `, [
            payload.status,
            payload.bayId || null,
            payload.timeInGate || null,
            payload.timeInBay || null,
            payload.timeOutBay || null,
            payload.timeOutGate || null,
            payload.id
          ]);
          break;

        case 'UPDATE_BOOKING_DETAILS':
          await sql(`
            UPDATE bookings SET 
              activity_type = $1, 
              notes = $2, 
              driver_phone = $3, 
              pallet_places = $4, 
              driver_license = $5, 
              driver_license_release = $6, 
              order_number = $7, 
              client_usage_id = $8, 
              license_plate_trailer = $9, 
              driver_license_expiry = $10, 
              order_number_2 = $11,
              is_edited_in_bay = $12,
              client_id = $13
            WHERE id = $14
          `, [
            payload.activityType, payload.notes || null, payload.driverPhone || null, payload.palletPlaces || null,
            payload.driverLicense || null, payload.driverLicenseRelease || null, payload.orderNumber || null,
            payload.clientUsageId || null, payload.licensePlateTrailer || null, payload.driverLicenseExpiry || null,
            payload.orderNumber2 || null, payload.isEditedInBay || false, payload.clientId || null, payload.id
          ]);
          break;

        case 'RELOCATE_BOOKING_BAY':
          await sql('UPDATE bookings SET bay_id = $1, is_edited_in_bay = TRUE, bay_change_reason = $2 WHERE id = $3', [
            payload.newBayId, payload.reason, payload.id
          ]);
          break;

        case 'ADD_BOOKING_NOTE':
          await sql('UPDATE bookings SET notes_history = $1::jsonb WHERE id = $2', [
            JSON.stringify(payload.notesHistory), payload.id
          ]);
          break;

        case 'SAVE_QUALITY_CHECKLIST':
          await sql('UPDATE bookings SET checklist = $1::jsonb WHERE id = $2', [
            JSON.stringify(payload.checklist), payload.id
          ]);
          break;

        case 'ADD_PALLET_RETURN':
          await sql('UPDATE bookings SET pallet_returns = $1::jsonb WHERE id = $2', [
            JSON.stringify(payload.palletReturns), payload.bookingId
          ]);
          break;

        case 'EMIT_PALLET_VOUCHER':
          await sql('UPDATE bookings SET pallet_voucher_number = $1 WHERE id = $2', [
            payload.palletVoucherNumber, payload.bookingId
          ]);
          break;

        case 'ADD_ANOMALY':
          await sql('INSERT INTO anomalies (id, depot_id, type, message, timestamp, resolved, booking_id, ticket_number, license_plate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
            payload.id, payload.depotId, payload.type, payload.message, payload.timestamp, payload.resolved || false,
            payload.bookingId || null, payload.ticketNumber || null, payload.licensePlate || null
          ]);
          break;

        case 'RESOLVE_ANOMALY':
          await sql('UPDATE anomalies SET resolved = TRUE, resolution_notes = $1, resolved_by = $2, resolved_at = $3 WHERE id = $4', [
            payload.resolutionNotes, payload.resolvedBy, payload.resolvedAt, payload.id
          ]);
          break;

        case 'ADD_LOG':
          await sql('INSERT INTO activity_logs (id, timestamp, depot_id, message, type) VALUES ($1, $2, $3, $4, $5)', [
            payload.id, payload.timestamp, payload.depotId, payload.message, payload.type
          ]);
          break;
        case 'ADD_ACTIVITY_TYPE':
          await sql('INSERT INTO activity_types (id, code, name, base_duration_minutes, minutes_per_pallet) VALUES ($1, $2, $3, $4, $5)', [
            payload.id, payload.code, payload.name, payload.baseDurationMinutes, payload.minutesPerPallet
          ]);
          break;
        case 'UPDATE_ACTIVITY_TYPE':
          await sql('UPDATE activity_types SET name = $1, code = $2, base_duration_minutes = $3, minutes_per_pallet = $4 WHERE id = $5', [
            payload.name, payload.code, payload.baseDurationMinutes, payload.minutesPerPallet, payload.id
          ]);
          break;
        case 'DELETE_ACTIVITY_TYPE':
          await sql('DELETE FROM activity_types WHERE id = $1', [payload.id]);
          break;

        case 'ADD_REPORT_SCHEDULE':
          await sql('INSERT INTO report_schedules (id, name, frequency, recipients, report_type, active, depot_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
            payload.id, payload.name, payload.frequency, payload.recipients, payload.reportType, payload.active, payload.depotId
          ]);
          break;
        case 'UPDATE_REPORT_SCHEDULE':
          await sql('UPDATE report_schedules SET name = $1, frequency = $2, recipients = $3, report_type = $4 WHERE id = $5', [
            payload.name, payload.frequency, payload.recipients, payload.reportType, payload.id
          ]);
          break;
        case 'DELETE_REPORT_SCHEDULE':
          await sql('DELETE FROM report_schedules WHERE id = $1', [payload.id]);
          break;

        case 'TOGGLE_REPORT_SCHEDULE':
          await sql('UPDATE report_schedules SET active = $1 WHERE id = $2', [payload.active, payload.id]);
          break;

        case 'ADD_CLIENT':
          await sql('INSERT INTO clients (id, name, vat_number, email) VALUES ($1, $2, $3, $4)', [
            payload.id, payload.name, payload.vatNumber || null, payload.email || null
          ]);
          break;
        case 'UPDATE_CLIENT':
          await sql('UPDATE clients SET name = $1, vat_number = $2, email = $3 WHERE id = $4', [
            payload.name, payload.vatNumber || null, payload.email || null, payload.id
          ]);
          break;
        case 'DELETE_CLIENT':
          await sql('DELETE FROM clients WHERE id = $1', [payload.id]);
          break;

        case 'ADD_PALLET_TYPE':
          await sql('INSERT INTO pallet_types (id, name, description) VALUES ($1, $2, $3)', [
            payload.id, payload.name, payload.description || null
          ]);
          break;
        case 'UPDATE_PALLET_TYPE':
          await sql('UPDATE pallet_types SET name = $1, description = $2 WHERE id = $3', [
            payload.name, payload.description || null, payload.id
          ]);
          break;
        case 'DELETE_PALLET_TYPE':
          await sql('DELETE FROM pallet_types WHERE id = $1', [payload.id]);
          break;

        case 'ADD_USER':
          await sql('INSERT INTO users (id, name, username, email, role, depot_id, depot_ids, password, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
            payload.id, payload.name, payload.username, payload.email, payload.role, payload.depotIds[0] || '', JSON.stringify(payload.depotIds), payload.password || null, payload.status
          ]);
          break;
        case 'UPDATE_USER':
          await sql('UPDATE users SET name = $1, username = $2, email = $3, role = $4, depot_id = $5, depot_ids = $6 WHERE id = $7', [
            payload.name, payload.username, payload.email, payload.role, payload.depotIds[0] || '', JSON.stringify(payload.depotIds), payload.id
          ]);
          break;
        case 'CONFIRM_USER_EMAIL':
          await sql("UPDATE users SET status = 'FIRST_ACCESS' WHERE id = $1", [payload.id]);
          break;
        case 'SET_USER_PASSWORD':
          await sql("UPDATE users SET password = $1, status = 'ACTIVE' WHERE id = $2", [payload.password, payload.id]);
          break;
        case 'UPDATE_USER_ROLE':
          await sql('UPDATE users SET role = $1 WHERE id = $2', [payload.role, payload.id]);
          break;
        case 'DELETE_USER':
          await sql('DELETE FROM users WHERE id = $1', [payload.id]);
          break;

        case 'ADD_SHIPMENT':
          await sql(`
            INSERT INTO shipments (
              id, client_id, carrier_id, depot_id, order_number, order_number_2, activity_type, pallet_places, status,
              expected_date, expected_time, origin_or_destination, goods_type, license_plate, expected_delivery_date, booking_id,
              subject_name, address, city, cap, province, region, country, gross_weight, delivery_notes, internal_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
          `, [
            payload.id, payload.clientId, payload.carrierId, payload.depotId, payload.orderNumber, payload.orderNumber2 || null,
            payload.activityType, payload.palletPlaces, payload.status, payload.expectedDate, payload.expectedTime || null,
            payload.originOrDestination, payload.goodsType || null, payload.licensePlate || null, payload.expectedDeliveryDate || null, payload.bookingId || null,
            payload.subjectName || null, payload.address || null, payload.city || null, payload.cap || null, payload.province || null,
            payload.region || null, payload.country || null, payload.grossWeight || null, payload.deliveryNotes || null, payload.internalNotes || null
          ]);
          break;

        case 'UPDATE_SHIPMENT_STATUS':
          await sql('UPDATE shipments SET status = $1 WHERE id = $2', [payload.status, payload.id]);
          break;

        case 'UPDATE_SHIPMENT':
          await sql(`
            UPDATE shipments SET 
              client_id = $1, carrier_id = $2, depot_id = $3, order_number = $4, order_number_2 = $5,
              activity_type = $6, pallet_places = $7, expected_date = $8, expected_time = $9,
              origin_or_destination = $10, goods_type = $11, expected_delivery_date = $12,
              subject_name = $13, address = $14, city = $15, cap = $16, province = $17,
              region = $18, country = $19, gross_weight = $20, delivery_notes = $21, internal_notes = $22
            WHERE id = $23
          `, [
            payload.clientId, payload.carrierId, payload.depotId, payload.orderNumber, payload.orderNumber2 || null,
            payload.activityType, payload.palletPlaces, payload.expectedDate, payload.expectedTime || null,
            payload.originOrDestination, payload.goodsType || null, payload.expectedDeliveryDate || null,
            payload.subjectName || null, payload.address || null, payload.city || null, payload.cap || null, payload.province || null,
            payload.region || null, payload.country || null, payload.grossWeight || null, payload.deliveryNotes || null, payload.internalNotes || null,
            payload.id
          ]);
          break;

        case 'DELETE_SHIPMENT':
          await sql('DELETE FROM shipments WHERE id = $1', [payload.id]);
          break;

        case 'DELETE_SHIPMENTS':
          for (const id of payload.ids) {
            await sql('DELETE FROM shipments WHERE id = $1', [id]);
          }
          break;

        case 'BIND_SHIPMENTS_TO_BOOKING':
          for (const sId of payload.shipmentIds) {
            await sql("UPDATE shipments SET booking_id = $1, license_plate = $2, status = 'PIANIFICATO' WHERE id = $3", [
              payload.bookingId, payload.licensePlate, sId
            ]);
          }
          break;

        case 'UNBIND_SHIPMENT_FROM_BOOKING':
          await sql('UPDATE shipments SET booking_id = NULL, license_plate = NULL WHERE id = $1', [
            payload.shipmentId
          ]);
          break;

        default:
          return res.status(400).json({ error: 'Azione sconosciuta' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error: any) {
    console.error('Errore Database Serverless:', error);
    return res.status(500).json({ error: error.message || 'Errore interno del server' });
  }
}
