const fs = require('fs');

const tabReportsHeader = `import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface TabReportsProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabReports: React.FC<TabReportsProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { reportSchedules, addReportSchedule, toggleReportSchedule, deleteReportSchedule } = useApp();

  const [newRepName, setNewRepName] = useState('');
  const [newRepFreq, setNewRepFreq] = useState<'GIORNALIERO' | 'SETTIMANALE' | 'MENSILE'>('GIORNALIERO');
  const [newRepRecipients, setNewRepRecipients] = useState('');
  const [newRepType, setNewRepType] = useState('Saturazione Baie');

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName || !newRepRecipients) return;
    addReportSchedule(newRepName, newRepFreq, newRepRecipients, newRepType);
    setNewRepName('');
    setNewRepRecipients('');
  };

  const handleDeleteReport = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: \`Sei sicuro di voler eliminare la pianificazione "\${name}"?\`,
      onConfirm: () => deleteReportSchedule(id)
    });
  };

  return (
`;

let jsxContent = fs.readFileSync('src/components/admin/TabReports.tsx', 'utf8');

// Remove the opening `{adminTab === 'reports' && (` and the closing `)}`
const startMatch = "{adminTab === 'reports' && (";
const endMatch = ")}";

let strippedContent = jsxContent.replace(startMatch, '').trim();
if (strippedContent.endsWith(endMatch)) {
  strippedContent = strippedContent.substring(0, strippedContent.length - endMatch.length).trim();
}

// Replace handleDelete
strippedContent = strippedContent.replace(
  /onClick=\{\(\) => handleDelete\('reportSchedule', (.*?), (.*?)\)\}/g,
  "onClick={() => handleDeleteReport($1, $2)}"
);


const fullFile = tabReportsHeader + strippedContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabReports.tsx', fullFile);
console.log('TabReports.tsx assembled successfully!');
