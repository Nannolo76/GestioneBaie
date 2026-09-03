const fs = require('fs');
let s = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
s = s.replace(/<select\\n\\s*value={selectedDepotId}/g, '<select aria-label=\"Plant\"\n                        value={selectedDepotId}');
fs.writeFileSync('src/components/Sidebar.tsx', s);
