const fs = require('fs');
let daPath = 'src/pages/DashboardAdmin.tsx';
if (fs.existsSync(daPath)) {
  let content = fs.readFileSync(daPath, 'utf8');
  let start = content.indexOf('// Form Submits');
  let end = content.indexOf('// const filteredComuniTable');
  
  if (start !== -1 && end !== -1) {
    // Find the end of the filteredComuniTable block
    let endOfComuni = content.indexOf('c.provincia.toLowerCase().includes(comuniSearch.toLowerCase())', end);
    if (endOfComuni !== -1) {
      endOfComuni = content.indexOf(').slice(0, 500);', endOfComuni) + 16;
    }
    
    if (endOfComuni !== -1) {
      content = content.substring(0, start) + content.substring(endOfComuni);
      fs.writeFileSync(daPath, content);
      console.log('Fixed DashboardAdmin');
    }
  }
}
