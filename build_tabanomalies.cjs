const fs = require('fs');

const tabAnomaliesHeader = `import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface TabAnomaliesProps {
  setActiveResolveAnomalyId: (id: string | null) => void;
  setResolveNotes: (notes: string) => void;
}

export const TabAnomalies: React.FC<TabAnomaliesProps> = ({ setActiveResolveAnomalyId, setResolveNotes }) => {
  const { anomalies, depots } = useApp();

  return (
`;

let jsxContent = fs.readFileSync('src/components/admin/TabAnomalies.tsx', 'utf8');

// Remove the opening `{adminTab === 'anomalies' && (` and the closing `)}`
const startMatch = "{adminTab === 'anomalies' && (";
const endMatch = ")}";

let strippedContent = jsxContent.replace(startMatch, '').trim();
if (strippedContent.endsWith(endMatch)) {
  strippedContent = strippedContent.substring(0, strippedContent.length - endMatch.length).trim();
}

const fullFile = tabAnomaliesHeader + strippedContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabAnomalies.tsx', fullFile);
console.log('TabAnomalies.tsx assembled successfully!');
