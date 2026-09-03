const fs = require('fs');

const tabUsersHeader = `import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';

interface TabUsersProps {
  setEditingItem: (item: any) => void;
  setConfirmDialogState: (state: any) => void;
}

export const TabUsers: React.FC<TabUsersProps> = ({ setEditingItem, setConfirmDialogState }) => {
  const { users, depots, addUser, deleteUser, currentUser } = useApp();

  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATORE_YARD' | 'GUARDIA_CANCELLO' | 'PREPOSTO'>('OPERATORE_YARD');
  const [newUserDepotIds, setNewUserDepotIds] = useState<string[]>([]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername || !newUserEmail || newUserDepotIds.length === 0) return;
    
    // Simulate sending email to User
    console.log(\`Simulated Email Sent to \${newUserEmail} for account creation.\`);
    
    addUser(newUserName, newUserEmail, newUserRole, newUserDepotIds[0], newUserDepotIds, newUserUsername);
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserRole('OPERATORE_YARD');
    setNewUserDepotIds([]);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setConfirmDialogState({
      isOpen: true,
      title: 'Conferma Eliminazione',
      message: \`Sei sicuro di voler eliminare l'utente "\${name}"?\`,
      onConfirm: () => deleteUser(id)
    });
  };

  return (
`;

let jsxContent = fs.readFileSync('src/components/admin/TabUsers.tsx', 'utf8');

// Remove the opening `{adminTab === 'users' && (` and the closing `)}`
const startMatch = "{adminTab === 'users' && (";
const endMatch = ")}";

let strippedContent = jsxContent.replace(startMatch, '').trim();
if (strippedContent.endsWith(endMatch)) {
  strippedContent = strippedContent.substring(0, strippedContent.length - endMatch.length).trim();
}

// Replace handleDelete and currentUser
strippedContent = strippedContent.replace(
  /onClick=\{\(\) => handleDelete\('user', (.*?), (.*?)\)\}/g,
  "onClick={() => handleDeleteUser($1, $2)}"
).replace(
  /useApp\(\)\.currentUser/g,
  "currentUser"
);


const fullFile = tabUsersHeader + strippedContent + '\n  );\n};\n';

fs.writeFileSync('src/components/admin/TabUsers.tsx', fullFile);
console.log('TabUsers.tsx assembled successfully!');
