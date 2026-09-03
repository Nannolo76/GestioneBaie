const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabCarriers }')) {
  content = content.replace(
    "import { TabHubs } from '../components/admin/TabHubs';",
    "import { TabHubs } from '../components/admin/TabHubs';\nimport { TabCarriers } from '../components/admin/TabCarriers';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: VALIDAZIONE VETTORI --- */}");
const endIdx = content.indexOf("{/* --- TAB: TIPOLOGIE ATTIVITÀ --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: VALIDAZIONE VETTORI --- */}
      {adminTab === 'carriers' && (
        <TabCarriers
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabCarriers');
} else {
  console.log('Could not find boundaries for TabCarriers JSX', startIdx, endIdx);
}
