const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabComuni }')) {
  content = content.replace(
    "import { TabPalletTypes } from '../components/admin/TabPalletTypes';",
    "import { TabPalletTypes } from '../components/admin/TabPalletTypes';\nimport { TabComuni } from '../components/admin/TabComuni';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: ANAGRAFICA COMUNI --- */}");
const endIdx = content.indexOf("{editingItem && (");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: ANAGRAFICA COMUNI --- */}
      {adminTab === 'comuni' && (
        <TabComuni comuni={comuni} />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabComuni');
} else {
  console.log('Could not find boundaries for TabComuni JSX', startIdx, endIdx);
}
