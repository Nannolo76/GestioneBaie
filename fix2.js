const fs = require('fs');
let code = fs.readFileSync('src/components/admin/TabHubs.tsx', 'utf8');

// The goal is to make sure we have exactly:
// return (
//   <>
//     {adminTab === 'hubs' && ( ... )}
//     {adminTab === 'modules' && ( ... )}
//     {adminTab === 'bayusages' && ( ... )}
//   </>
// );
// };

// 1. Remove everything from the FIRST 'return (' to the end of the file
const retIdx = code.indexOf('  return (');
const prefix = code.slice(0, retIdx);

// 2. We can just use string replacements on the original file from github to get it right.
// Let's reset the file first.
