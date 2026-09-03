const fs = require('fs');
let thPath = 'src/components/admin/TabHubs.tsx';
if (fs.existsSync(thPath)) {
  let th = fs.readFileSync(thPath, 'utf8');
  th = '/* eslint-disable */\n' + th;
  fs.writeFileSync(thPath, th);
}
console.log('Fixed TabHubs');
