const fs = require('fs');

const tabPalletTypesHeader = `import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabPalletTypesProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabPalletTypes: React.FC<TabPalletTypesProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { palletTypes, addPalletType, deletePalletType } = useApp();

  const [newPalletName, setNewPalletName] = useState('');
  const [newPalletDesc, setNewPalletDesc] = useState('');

  const handleAddPalletType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPalletName) return;
    addPalletType(newPalletName, newPalletDesc);
    setNewPalletName('');
    setNewPalletDesc('');
  };

  const handleDeletePalletType = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: \`Sei sicuro di voler eliminare la tipologia pallet "\${name}"?\`,
      onConfirm: () => deletePalletType(id)
    });
  };

  return (
`;

let jsxContent = fs.readFileSync('src/components/admin/TabPalletTypes.tsx', 'utf8');

// Remove the opening `{adminTab === 'pallettypes' && (` and the closing `)}`
const startMatch = "{adminTab === 'pallettypes' && (";
const endMatch = ")}";

let strippedContent = jsxContent.replace(startMatch, '').trim();
if (strippedContent.endsWith(endMatch)) {
  strippedContent = strippedContent.substring(0, strippedContent.length - endMatch.length).trim();
}

// Replace handleDelete
strippedContent = strippedContent.replace(
  /onClick=\{\(\) => handleDelete\('palletType', (.*?), (.*?)\)\}/g,
  "onClick={() => handleDeletePalletType($1, $2)}"
);


const fullFile = tabPalletTypesHeader + strippedContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabPalletTypes.tsx', fullFile);
console.log('TabPalletTypes.tsx assembled successfully!');
