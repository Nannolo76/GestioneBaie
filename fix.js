const fs = require('fs');

const text = fs.readFileSync('src/components/admin/TabHubs.tsx', 'utf8');
const retIdx = text.indexOf('  return (\n');

const prefix = text.slice(0, retIdx);
const jsx = text.slice(retIdx + 11);

const parts = jsx.split('{/* --- TAB: MODULI MAGAZZINO --- */}');
let hubs_part = parts[0].trim();
let rest = parts[1];

const parts2 = rest.split('{/* --- TAB: USO BAIE --- */}');
let modules_part = parts2[0].trim();
let bayusages_part = parts2[1].trim();

// Hubs
if (hubs_part.endsWith(')}')) hubs_part = hubs_part.slice(0, -2).trim();

// Modules
if (modules_part.startsWith("{adminTab === 'modules' && (")) modules_part = modules_part.slice("{adminTab === 'modules' && (".length).trim();
if (modules_part.endsWith(')}')) modules_part = modules_part.slice(0, -2).trim();

// Bay usages
if (bayusages_part.startsWith("{adminTab === 'bayusages' && (")) bayusages_part = bayusages_part.slice("{adminTab === 'bayusages' && (".length).trim();

// Remove the end of the file from bayusages
bayusages_part = bayusages_part.replace(/\}\s*\)\s*;\s*\}\s*;\s*$/, '').trim();

const newJsx = \  return (
    <>
      {adminTab === 'hubs' && (
        \
      )}

      {/* --- TAB: MODULI MAGAZZINO --- */}
      {adminTab === 'modules' && (
        \
      )}

      {/* --- TAB: USO BAIE --- */}
      {adminTab === 'bayusages' && (
        \
      )}
    </>
  );
};
\;

fs.writeFileSync('src/components/admin/TabHubs.tsx', prefix + newJsx);
console.log('Done!');
