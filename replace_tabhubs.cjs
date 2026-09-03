const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabHubs }')) {
  content = content.replace(
    "import { ConfirmDialog } from '../components/ui/ConfirmDialog';",
    "import { ConfirmDialog } from '../components/ui/ConfirmDialog';\nimport { TabHubs } from '../components/admin/TabHubs';"
  );
}

const startIdx = content.indexOf("{adminTab === 'hubs' && (");
const endIdx = content.indexOf("{/* --- TAB: VALIDAZIONE VETTORI --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{adminTab === 'hubs' && (
        <TabHubs
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
          comuni={comuni}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx');
} else {
  console.log('Could not find boundaries for TabHubs JSX');
}
