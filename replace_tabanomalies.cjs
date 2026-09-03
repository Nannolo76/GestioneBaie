const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardAdmin.tsx', 'utf8');

if (!content.includes('import { TabAnomalies }')) {
  content = content.replace(
    "import { TabActivities } from '../components/admin/TabActivities';",
    "import { TabActivities } from '../components/admin/TabActivities';\nimport { TabAnomalies } from '../components/admin/TabAnomalies';"
  );
}

const startIdx = content.indexOf("{/* --- TAB: GESTIONE ANOMALIE --- */}");
const endIdx = content.indexOf("{/* --- TAB: SCHEDULATORE REPORT --- */}");

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* --- TAB: GESTIONE ANOMALIE --- */}
      {adminTab === 'anomalies' && (
        <TabAnomalies
          setActiveResolveAnomalyId={setActiveResolveAnomalyId}
          setResolveNotes={setResolveNotes}
        />
      )}

      `;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/pages/DashboardAdmin.tsx', content);
  console.log('Replaced JSX in DashboardAdmin.tsx for TabAnomalies');
} else {
  console.log('Could not find boundaries for TabAnomalies JSX', startIdx, endIdx);
}
