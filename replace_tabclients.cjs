const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabClients }')) {
  content = content.replace(
    "import { TabUsers } from '../components/admin/TabUsers';",
    "import { TabUsers } from '../components/admin/TabUsers';\nimport { TabClients } from '../components/admin/TabClients';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: GESTIONE CLIENTI --- */}");
const endIdx = content.indexOf("{/* --- TAB: TIPOLOGIE PALLET --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: GESTIONE CLIENTI --- */}
      {adminTab === 'clients' && (
        <TabClients
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabClients');
} else {
  console.log('Could not find boundaries for TabClients JSX', startIdx, endIdx);
}
