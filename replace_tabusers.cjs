const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabUsers }')) {
  content = content.replace(
    "import { TabReports } from '../components/admin/TabReports';",
    "import { TabReports } from '../components/admin/TabReports';\nimport { TabUsers } from '../components/admin/TabUsers';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: UTENTI E PERMESSI --- */}");
const endIdx = content.indexOf("{/* --- TAB: GESTIONE CLIENTI --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: UTENTI E PERMESSI --- */}
      {adminTab === 'users' && (
        <TabUsers
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabUsers');
} else {
  console.log('Could not find boundaries for TabUsers JSX', startIdx, endIdx);
}
