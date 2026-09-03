const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabPalletTypes }')) {
  content = content.replace(
    "import { TabClients } from '../components/admin/TabClients';",
    "import { TabClients } from '../components/admin/TabClients';\nimport { TabPalletTypes } from '../components/admin/TabPalletTypes';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: TIPOLOGIE PALLET --- */}");
const endIdx = content.indexOf("{/* --- TAB: ANAGRAFICA COMUNI --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: TIPOLOGIE PALLET --- */}
      {adminTab === 'pallettypes' && (
        <TabPalletTypes
          setEditingItem={setEditingItem}
          setConfirmDialogState={setConfirmDialogState}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabPalletTypes');
} else {
  console.log('Could not find boundaries for TabPalletTypes JSX', startIdx, endIdx);
}
