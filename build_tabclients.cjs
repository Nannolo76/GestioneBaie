const fs = require('fs');

const tabClientsHeader = `import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';

interface TabClientsProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabClients: React.FC<TabClientsProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { clients, depots, addClient, deleteClient } = useApp();

  const [newClientName, setNewClientName] = useState('');
  const [newClientVat, setNewClientVat] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDefaultDepotId, setNewClientDefaultDepotId] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    addClient(newClientName, newClientVat, newClientEmail, newClientDefaultDepotId);
    setNewClientName('');
    setNewClientVat('');
    setNewClientEmail('');
    setNewClientDefaultDepotId('');
  };

  const handleDeleteClient = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: \`Sei sicuro di voler eliminare il cliente "\${name}"?\`,
      onConfirm: () => deleteClient(id)
    });
  };

  return (
`;

let jsxContent = fs.readFileSync('src/components/admin/TabClients.tsx', 'utf8');

// Remove the opening `{adminTab === 'clients' && (` and the closing `)}`
const startMatch = "{adminTab === 'clients' && (";
const endMatch = ")}";

let strippedContent = jsxContent.replace(startMatch, '').trim();
if (strippedContent.endsWith(endMatch)) {
  strippedContent = strippedContent.substring(0, strippedContent.length - endMatch.length).trim();
}

// Replace handleDelete
strippedContent = strippedContent.replace(
  /onClick=\{\(\) => handleDelete\('client', (.*?), (.*?)\)\}/g,
  "onClick={() => handleDeleteClient($1, $2)}"
);


const fullFile = tabClientsHeader + strippedContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabClients.tsx', fullFile);
console.log('TabClients.tsx assembled successfully!');
