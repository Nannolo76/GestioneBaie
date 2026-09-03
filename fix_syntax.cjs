const fs = require('fs');

let seed = fs.readFileSync('api/seed.ts', 'utf8');
seed = seed.replace(/const queryStr =\s*INSERT INTO/g, 'const queryStr = `\\n        INSERT INTO');
seed = seed.replace(/json_to_recordset\(' \+ safeJsonStr \+ '::json\)/g, "json_to_recordset('${safeJsonStr}'::json)`");
fs.writeFileSync('api/seed.ts', seed);

let terr = fs.readFileSync('api/territory_ingest.ts', 'utf8');
terr = terr.replace(/await client\.query\(\s*\+\s*""\s*\+\s*CREATE TABLE/g, 'await client.query(`\\n        CREATE TABLE');
terr = terr.replace(/      await client\.query\(\s*INSERT INTO anagrafica_territoriale/g, '      await client.query(`\\n        INSERT INTO anagrafica_territoriale');
terr = terr.replace(/\);\s*\} catch/g, '`);\\n    } catch');
fs.writeFileSync('api/territory_ingest.ts', terr);

// TabHubs
let tabHubs = fs.readFileSync('src/components/admin/TabHubs.tsx', 'utf8');
tabHubs = tabHubs.replace("import { ConfirmDialog } from '../ui/ConfirmDialog';", "");
tabHubs = tabHubs.replace("deleteDepot,", "");
tabHubs = tabHubs.replace("deleteWarehouseModule,", "");
tabHubs = tabHubs.replace("deleteBay,", "");
tabHubs = tabHubs.replace("deleteBayUsage,", "");
fs.writeFileSync('src/components/admin/TabHubs.tsx', tabHubs);

console.log('Fixed syntax and unused vars');
