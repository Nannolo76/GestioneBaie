const fs = require('fs');

const tabComuniHeader = `import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabComuniProps {
  comuni: any[];
}

export const TabComuni: React.FC<TabComuniProps> = ({ comuni }) => {
  const [comuniSearch, setComuniSearch] = useState('');

  const filteredComuniTable = useMemo(() => {
    return (comuni || []).filter(c => 
      c.comune.toLowerCase().includes(comuniSearch.toLowerCase()) ||
      c.cap.includes(comuniSearch) ||
      c.provincia.toLowerCase().includes(comuniSearch.toLowerCase())
    ).slice(0, 500); // Prevent lagging by limiting to 500 results
  }, [comuni, comuniSearch]);

  return (
`;

let jsxContent = fs.readFileSync('src/components/admin/TabComuni.tsx', 'utf8');

// Remove the opening `{adminTab === 'comuni' && (` and the closing `)}`
const startMatch = "{adminTab === 'comuni' && (";
const endMatch = ")}";

let strippedContent = jsxContent.replace(startMatch, '').trim();
if (strippedContent.endsWith(endMatch)) {
  strippedContent = strippedContent.substring(0, strippedContent.length - endMatch.length).trim();
}

const fullFile = tabComuniHeader + strippedContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabComuni.tsx', fullFile);
console.log('TabComuni.tsx assembled successfully!');
