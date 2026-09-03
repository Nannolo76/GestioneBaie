const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabActivities }')) {
  content = content.replace(
    "import { TabCarriers } from '../components/admin/TabCarriers';",
    "import { TabCarriers } from '../components/admin/TabCarriers';\nimport { TabActivities } from '../components/admin/TabActivities';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: TIPOLOGIE ATTIVITÀ --- */}");
const endIdx = content.indexOf("{/* --- TAB: GESTIONE ANOMALIE --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: TIPOLOGIE ATTIVITÀ --- */}
      {adminTab === 'activities' && (
        <TabActivities
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabActivities');
} else {
  console.log('Could not find boundaries for TabActivities JSX', startIdx, endIdx);
}
