const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabReports }')) {
  content = content.replace(
    "import { TabAnomalies } from '../components/admin/TabAnomalies';",
    "import { TabAnomalies } from '../components/admin/TabAnomalies';\nimport { TabReports } from '../components/admin/TabReports';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: SCHEDULATORE REPORT --- */}");
const endIdx = content.indexOf("{/* --- TAB: UTENTI E PERMESSI --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: SCHEDULATORE REPORT --- */}
      {adminTab === 'reports' && (
        <TabReports
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabReports');
} else {
  console.log('Could not find boundaries for TabReports JSX', startIdx, endIdx);
}
