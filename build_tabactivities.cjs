const fs = require('fs');

const tabActivitiesHeader = `import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabActivitiesProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabActivities: React.FC<TabActivitiesProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { activityTypes, addActivityType, deleteActivityType } = useApp();

  const [newActName, setNewActName] = useState('');
  const [newActCode, setNewActCode] = useState('');
  const [newActBaseDuration, setNewActBaseDuration] = useState(15);
  const [newActMinPerPallet, setNewActMinPerPallet] = useState(2);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName || !newActCode) return;
    addActivityType(newActCode, newActName, newActBaseDuration, newActMinPerPallet);
    setNewActName('');
    setNewActCode('');
    setNewActBaseDuration(15);
    setNewActMinPerPallet(2);
  };

  const handleDeleteActivity = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: \`Sei sicuro di voler eliminare l'attività "\${name}"?\`,
      onConfirm: () => deleteActivityType(id)
    });
  };

  return (
`;

let jsxContent = fs.readFileSync('src/components/admin/TabActivities.tsx', 'utf8');

// Remove the opening `{adminTab === 'activities' && (` and the closing `)}`
const startMatch = "{adminTab === 'activities' && (";
const endMatch = ")}";

let strippedContent = jsxContent.replace(startMatch, '').trim();
if (strippedContent.endsWith(endMatch)) {
  strippedContent = strippedContent.substring(0, strippedContent.length - endMatch.length).trim();
}

// Replace handleDelete
strippedContent = strippedContent.replace(
  /onClick=\{\(\) => handleDelete\('activityType', (.*?), (.*?)\)\}/g,
  "onClick={() => handleDeleteActivity($1, $2)}"
);


const fullFile = tabActivitiesHeader + strippedContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabActivities.tsx', fullFile);
console.log('TabActivities.tsx assembled successfully!');
